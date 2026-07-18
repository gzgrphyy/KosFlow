import { z } from 'zod'

const updateRoomSchema = z.object({
  roomNumber: z.string().min(1).max(20).optional(),
  monthlyRate: z.number().positive().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdminOrOwner(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID kamar diperlukan' })

  const body = await readBody(event)
  const parsed = updateRoomSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Input tidak valid', data: parsed.error.flatten() })
  }

  const existing = await prisma.room.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kamar tidak ditemukan' })

  if (parsed.data.roomNumber && parsed.data.roomNumber !== existing.roomNumber) {
    const conflict = await prisma.room.findUnique({ where: { roomNumber: parsed.data.roomNumber } })
    if (conflict) throw createError({ statusCode: 409, statusMessage: 'Nomor kamar sudah digunakan' })
  }

  const room = await prisma.room.update({
    where: { id },
    data: parsed.data,
  })

  await writeAuditLog({
    userId: user.id,
    action: 'ROOM_UPDATED',
    entityType: 'Room',
    entityId: room.id,
    metadata: parsed.data,
  })

  return { ...room, monthlyRate: Number(room.monthlyRate) }
})
