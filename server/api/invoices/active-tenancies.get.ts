// server/api/invoices/active-tenancies.get.ts
// Endpoint khusus untuk dropdown di form generate tagihan
// Return: semua tenancy ACTIVE beserta info tenant + kamar
export default defineEventHandler(async (event) => {
    await requireAuth(event)

    const tenancies = await prisma.tenancy.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
            tenant: { select: { id: true, fullName: true } },
            room: { select: { id: true, roomNumber: true, monthlyRate: true } },
        },
    })

    return tenancies.map(t => ({
        id: t.id,
        tenant: t.tenant,
        room: {
            ...t.room,
            monthlyRate: Number(t.room.monthlyRate),
        },
        startDate: t.startDate,
    }))
})
