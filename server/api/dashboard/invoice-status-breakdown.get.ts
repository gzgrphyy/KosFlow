export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const invoices = await prisma.invoice.findMany({
    where: { period: month },
    include: { items: { select: { amount: true } } },
  })

  const statuses = ['LUNAS', 'SEBAGIAN', 'BELUM_LUNAS', 'TELAT'] as const

  const grouped: Record<string, { count: number; total: number }> = {}
  for (const s of statuses) {
    grouped[s] = { count: 0, total: 0 }
  }

  for (const inv of invoices) {
    const total = inv.items.reduce((sum, item) => sum + Number(item.amount), 0)
    grouped[inv.status].count += 1
    grouped[inv.status].total += total
  }

  return statuses.map((status) => ({
    status,
    count: grouped[status].count,
    total: grouped[status].total,
  }))
})
