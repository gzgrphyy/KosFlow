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

  const parsed = uploadSchema.safeParse(textFields)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Input tidak valid', data: parsed.error.flatten() })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: {
      tenancy: { include: { tenant: { select: { fullName: true } }, room: { select: { roomNumber: true } } } },
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
  } else {
    throw createError({ statusCode: 400, statusMessage: 'File bukti pembayaran wajib diunggah' })
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: parsed.data.invoiceId,
      amount: parsed.data.amount,
      method: parsed.data.method as any,
      referenceNo: parsed.data.referenceNo,
      proofUrl,
      paymentDate: new Date(parsed.data.paymentDate),
      status: 'PENDING',
      notes: parsed.data.notes,
    },
  })

  await writeAuditLog({
    userId: user.id,
    action: 'PAYMENT_CREATED',
    entityType: 'Payment',
    entityId: payment.id,
    metadata: {
      amount: parsed.data.amount,
      method: parsed.data.method,
      period: invoice.period,
      roomNumber: invoice.tenancy.room.roomNumber,
      tenantName: invoice.tenancy.tenant.fullName,
    },
  })

  return {
    id: payment.id,
    amount: Number(payment.amount),
    status: payment.status,
    proofUrl: payment.proofUrl,
  }
})
