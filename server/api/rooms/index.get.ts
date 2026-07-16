import { z } from 'zod'

const querySchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']).optional(),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = await getValidatedQuery(event, querySchema.parse)

  const rooms = await prisma.room.findMany({
    where: query.status ? { status: query.status } : undefined,
    orderBy: { roomNumber: 'asc' },
  })

  return rooms.map(r => ({ ...r, monthlyRate: Number(r.monthlyRate) }))
})
