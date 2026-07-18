import { z } from 'zod'
import { writeFile } from 'node:fs/promises'

const uploadSchema = z.object({
  invoiceId: z.string().min(1, 'ID invoice diperlukan'),
  amount: z.number().positive('Jumlah harus lebih dari 0'),
  method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'E_WALLET', 'LAINNYA']),
  referenceNo: z.string().max(100).optional(),
  paymentDate: z.string().refine(v => !isNaN(Date.parse(v)), 'Format tanggal tidak valid'),
  notes: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdminOrOwner(event)

  const body = await readMultipartFormData(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Data tidak ditemukan' })
  }

  const textFields: Record<string, string> = {}
  let fileBuffer: Buffer | null = null
  let fileExt = ''

  for (const field of body) {
    if (field.filename) {
      fileBuffer = field.data
      const name = field.filename || ''
      fileExt = name.split('.').pop()?.toLowerCase() || 'jpg'
      if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(fileExt)) {
        throw createError({ statusCode: 400, statusMessage: 'Format file harus JPG, PNG, WebP, atau PDF' })
      }
    } else if (field.name) {
      textFields[field.name] = field.data.toString('utf-8')
    }
  }

  const parsed = uploadSchema.safeParse({
    ...textFields,
    amount: textFields.amount ? Number(textFields.amount) : undefined,
    referenceNo: textFields.referenceNo || undefined,
    notes: textFields.notes || undefined,
  })
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Input tidak valid', data: parsed.error.flatten() })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: {
      tenancy: { include: { tenant: { select: { fullName: true } }, room: { select: { roomNumber: true } } } },
      items: { select: { amount: true } },
    },
  })

  if (!invoice) {
    throw createError({ statusCode: 404, statusMessage: 'Tagihan tidak ditemukan' })
  }

  let proofUrl = ''

  if (fileBuffer) {
    const fileName = `${parsed.data.invoiceId.slice(0, 8)}-${Date.now()}.${fileExt}`
    const filePath = `public/uploads/payments/${fileName}`
    await writeFile(filePath, fileBuffer)
    proofUrl = `/uploads/payments/${fileName}`
  }

  const isCash = parsed.data.method === 'CASH'

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        invoiceId: parsed.data.invoiceId,
        amount: parsed.data.amount,
        method: parsed.data.method as any,
        referenceNo: parsed.data.referenceNo,
        proofUrl,
        paymentDate: new Date(parsed.data.paymentDate),
        status: isCash ? 'VERIFIED' : 'PENDING',
        verifiedById: isCash ? user.id : undefined,
        verifiedAt: isCash ? new Date() : undefined,
        notes: parsed.data.notes,
      },
    })

    if (isCash) {
      const allVerified = await tx.payment.findMany({
        where: { invoiceId: parsed.data.invoiceId, status: 'VERIFIED' },
        select: { amount: true },
      })
      const totalInvoice = invoice.items.reduce((s, i) => s + Number(i.amount), 0)
      const totalPaid = allVerified.reduce((s, p) => s + Number(p.amount), 0)

      let invoiceStatus: string
      if (totalPaid >= totalInvoice) {
        invoiceStatus = 'LUNAS'
      } else if (totalPaid > 0) {
        invoiceStatus = 'SEBAGIAN'
      } else {
        invoiceStatus = 'BELUM_LUNAS'
      }

      await tx.invoice.update({
        where: { id: parsed.data.invoiceId },
        data: { status: invoiceStatus as any },
      })
    }

    return created
  })

  await writeAuditLog({
    userId: user.id,
    action: isCash ? 'PAYMENT_VERIFIED' : 'PAYMENT_CREATED',
    entityType: 'Payment',
    entityId: payment.id,
    metadata: {
      amount: parsed.data.amount,
      method: parsed.data.method,
      period: invoice.period,
      roomNumber: invoice.tenancy.room.roomNumber,
      tenantName: invoice.tenancy.tenant.fullName,
      autoVerified: isCash,
    },
  })

  return {
    id: payment.id,
    amount: Number(payment.amount),
    status: payment.status,
    proofUrl: payment.proofUrl,
  }
})
