import { z } from 'zod'

const refundSchema = z.object({
  amount: z.number().positive('Jumlah refund harus lebih dari 0'),
  notes: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdminOrOwner(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID transaksi diperlukan' })

  const body = await readBody(event)
  const parsed = refundSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Data tidak valid', data: parsed.error.flatten() })
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          items: { select: { amount: true } },
          tenancy: { include: { tenant: { select: { fullName: true } }, room: { select: { roomNumber: true } } } },
        },
      },
    },
  })

  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  }

  if (payment.status !== 'VERIFIED') {
    throw createError({ statusCode: 400, statusMessage: 'Hanya pembayaran terverifikasi yang bisa direfund' })
  }

  const alreadyRefunded = Number(payment.refundedAmount ?? 0)
  const maxRefundable = Number(payment.amount) - alreadyRefunded

  if (parsed.data.amount > maxRefundable) {
    throw createError({
      statusCode: 400,
      statusMessage: `Jumlah refund tidak boleh melebihi sisa yang bisa dikembalikan (Rp ${maxRefundable.toLocaleString('id-ID')})`,
    })
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id },
      data: {
        refundedAmount: alreadyRefunded + parsed.data.amount,
        refundedAt: new Date(),
        refundNote: parsed.data.notes ?? null,
        refundedById: user.id,
      },
    })

    const allPayments = await tx.payment.findMany({
      where: { invoiceId: payment.invoiceId, status: 'VERIFIED' },
      select: { amount: true, refundedAmount: true },
    })

    const totalInvoice = payment.invoice.items.reduce((s, i) => s + Number(i.amount), 0)
    const netPaid = allPayments.reduce((s, p) => s + Number(p.amount) - Number(p.refundedAmount ?? 0), 0)

    let invoiceStatus: string
    if (netPaid >= totalInvoice) {
      invoiceStatus = 'LUNAS'
    } else if (netPaid > 0) {
      invoiceStatus = 'SEBAGIAN'
    } else {
      invoiceStatus = 'BELUM_LUNAS'
    }

    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: invoiceStatus as any },
    })

    return updated
  })

  await writeAuditLog({
    userId: user.id,
    action: 'PAYMENT_REFUNDED',
    entityType: 'Payment',
    entityId: id,
    metadata: {
      refundAmount: parsed.data.amount,
      totalRefunded: Number(result.refundedAmount),
      paymentAmount: Number(payment.amount),
      method: payment.method,
      period: payment.invoice.period,
      roomNumber: payment.invoice.tenancy.room.roomNumber,
      tenantName: payment.invoice.tenancy.tenant.fullName,
      notes: parsed.data.notes,
    },
  })

  return {
    id: result.id,
    refundedAmount: Number(result.refundedAmount),
    refundedAt: result.refundedAt,
  }
})
