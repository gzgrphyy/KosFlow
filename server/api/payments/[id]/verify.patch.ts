import { z } from 'zod'

const verifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdminOrOwner(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID transaksi diperlukan' })

  const body = await readBody(event)
  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Data tidak valid', data: parsed.error.flatten() })
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          items: { select: { amount: true } },
          payments: { where: { status: 'VERIFIED', id: { not: id } }, select: { amount: true } },
          tenancy: { include: { tenant: { select: { fullName: true } }, room: { select: { roomNumber: true } } } },
        },
      },
    },
  })

  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  }

  if (payment.status !== 'PENDING') {
    throw createError({ statusCode: 400, statusMessage: 'Transaksi ini sudah diverifikasi sebelumnya' })
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id },
      data: {
        status: parsed.data.status,
        verifiedById: user.id,
        verifiedAt: new Date(),
        notes: parsed.data.notes ?? payment.notes,
      },
    })

    if (parsed.data.status === 'VERIFIED') {
      const previousPaid = payment.invoice.payments.reduce((s, p) => s + Number(p.amount), 0)
      const totalInvoice = payment.invoice.items.reduce((s, i) => s + Number(i.amount), 0)
      const newTotalPaid = previousPaid + Number(payment.amount)

      let invoiceStatus: string
      if (newTotalPaid >= totalInvoice) {
        invoiceStatus = 'LUNAS'
      } else {
        invoiceStatus = 'BELUM_LUNAS'
      }

      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: invoiceStatus as any },
      })
    }

    return updated
  })

  await writeAuditLog({
    userId: user.id,
    action: parsed.data.status === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
    entityType: 'Payment',
    entityId: id,
    metadata: {
      amount: Number(payment.amount),
      method: payment.method,
      period: payment.invoice.period,
      roomNumber: payment.invoice.tenancy.room.roomNumber,
      tenantName: payment.invoice.tenancy.tenant.fullName,
      notes: parsed.data.notes,
    },
  })

  return { id: result.id, status: result.status }
})
