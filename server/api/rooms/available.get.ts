// server/api/rooms/available.get.ts
export default defineEventHandler(async (event) => {
    await requireAuth(event)

    const rooms = await prisma.room.findMany({
        where: { status: 'AVAILABLE' },
        orderBy: { roomNumber: 'asc' },
    })

    return rooms.map(r => ({ ...r, monthlyRate: Number(r.monthlyRate) }))
})
