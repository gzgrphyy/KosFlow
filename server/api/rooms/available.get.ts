// server/api/rooms/available.get.ts
// Public endpoint — tidak perlu login
export default defineEventHandler(async (event) => {
    const rooms = await prisma.room.findMany({
        where: { status: 'AVAILABLE' },
        orderBy: { roomNumber: 'asc' },
    })

    return rooms.map(r => ({ ...r, monthlyRate: Number(r.monthlyRate) }))
})
