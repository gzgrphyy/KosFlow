export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID transaksi diperlukan' })

  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { proofUrl: true },
  })

  if (!payment || !payment.proofUrl) {
    throw createError({ statusCode: 404, statusMessage: 'Bukti pembayaran tidak ditemukan' })
  }

  return sendRedirect(event, payment.proofUrl)
})
