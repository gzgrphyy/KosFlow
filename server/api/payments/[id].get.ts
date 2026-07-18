export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID transaksi diperlukan' })

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          items: { select: { amount: true } },
          tenancy: {
            include: {
              tenant: { select: { id: true, fullName: true, phone: true, email: true } },
              room: { select: { id: true, roomNumber: true, monthlyRate: true } },
            },
          },
        },
      },
      verifiedBy: { select: { id: true, name: true } },
    },
  })

  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  }

  const totalInvoice = payment.invoice.items.reduce((s, i) => s + Number(i.amount), 0)

  const allVerifiedPayments = await prisma.payment.findMany({
    where: { invoiceId: payment.invoiceId, status: 'VERIFIED' },
    select: { amount: true },
  })
  const totalPaid = allVerifiedPayments.reduce((s, p) => s + Number(p.amount), 0)
  const remaining = totalInvoice - totalPaid

  return {
    id: payment.id,
    amount: Number(payment.amount),
    method: payment.method,
    referenceNo: payment.referenceNo,
    proofUrl: payment.proofUrl,
    paymentDate: payment.paymentDate,
    status: payment.status,
    notes: payment.notes,
    verifiedAt: payment.verifiedAt,
    createdAt: payment.createdAt,
    invoice: {
      id: payment.invoice.id,
      period: payment.invoice.period,
      dueDate: payment.invoice.dueDate,
      status: payment.invoice.status,
      total: totalInvoice,
    },
    tenant: payment.invoice.tenancy.tenant,
    room: {
      ...payment.invoice.tenancy.room,
      monthlyRate: Number(payment.invoice.tenancy.room.monthlyRate),
    },
    paymentSummary: {
      totalPaid,
      remaining: Math.max(remaining, 0),
      isFullyPaid: remaining <= 0,
    },
    verifiedBy: payment.verifiedBy,
  }
})
