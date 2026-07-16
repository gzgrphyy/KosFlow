import { z } from 'zod'

const createRoomSchema = z.object({
  roomNumber: z.string().min(1).max(20),
  monthlyRate: z.number().positive(),
  status: z.enum(['AVAILABLE', 'MAINTENANCE']).default('AVAILABLE'),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdminOrOwner(event)

  const body = await readBody(event)
  const parsed = createRoomSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Input tidak valid', data: parsed.error.flatten() })
  }

  const { roomNumber, monthlyRate, status } = parsed.data

  const existing = await prisma.room.findUnique({ where: { roomNumber } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Nomor kamar sudah ada' })
  }

  const room = await prisma.room.create({
    data: { roomNumber, monthlyRate, status },
  })

  await writeAuditLog({
    userId: user.id,
    action: 'ROOM_CREATED',
    entityType: 'Room',
    entityId: room.id,
    metadata: { roomNumber, monthlyRate },
  })

  return { ...room, monthlyRate: Number(room.monthlyRate) }
})
