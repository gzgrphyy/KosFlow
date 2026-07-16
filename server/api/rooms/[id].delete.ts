export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID kamar diperlukan' })

  const existing = await prisma.room.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kamar tidak ditemukan' })

  const hasActiveTenancy = await prisma.tenancy.findFirst({
    where: { roomId: id, status: 'ACTIVE' },
  })
  if (hasActiveTenancy) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa hapus kamar yang masih punya penghuni aktif' })
  }

  await prisma.room.delete({ where: { id } })

  await writeAuditLog({
    userId: user.id,
    action: 'ROOM_DELETED',
    entityType: 'Room',
    entityId: id,
    metadata: { roomNumber: existing.roomNumber },
  })

  return { success: true }
})
