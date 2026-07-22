// server/api/rooms/available.get.ts
// Public endpoint — tidak perlu login
export default defineEventHandler(async (event) => {
    try {
        const rooms = await prisma.room.findMany({
            where: { status: 'AVAILABLE' },
            orderBy: { roomNumber: 'asc' },
        })

        return rooms.map(r => ({ ...r, monthlyRate: Number(r.monthlyRate) }))
    } catch (err) {
        // Jika database tidak tersedia, kembalikan array kosong
        console.error('Gagal fetch kamar tersedia:', err instanceof Error ? err.message : err)
        return []
    }
})
