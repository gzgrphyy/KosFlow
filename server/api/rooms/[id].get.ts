export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID kamar diperlukan' })

  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Kamar tidak ditemukan' })

  return { ...room, monthlyRate: Number(room.monthlyRate) }
})
