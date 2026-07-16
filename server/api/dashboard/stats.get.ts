export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    activeTenants,
    monthlyInvoices,
    pendingPayments,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: 'AVAILABLE' } }),
    prisma.room.count({ where: { status: 'OCCUPIED' } }),
    prisma.room.count({ where: { status: 'MAINTENANCE' } }),
    prisma.tenancy.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.findMany({
      where: { period: month },
      include: { items: { select: { amount: true } } },
    }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
  ])

  const monthlyTotal = monthlyInvoices.reduce(
    (sum, inv) => sum + inv.items.reduce((s, item) => s + Number(item.amount), 0),
    0,
  )

  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    activeTenants,
    monthlyInvoices: monthlyInvoices.length,
    monthlyTotal,
    pendingPayments,
  }
})
