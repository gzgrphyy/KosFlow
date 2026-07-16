// server/api/tenants/[id].assign.post.ts
import { z } from 'zod'
import { tenantIdParamSchema } from '../../utils/validation/tenant'

const assignSchema = z.object({
    roomId: z.string().min(1, 'ID kamar diperlukan'),
    startDate: z.string().refine(v => !isNaN(Date.parse(v)), 'Format tanggal tidak valid'),
})

export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const params = tenantIdParamSchema.safeParse({ id: getRouterParam(event, 'id') })
    if (!params.success) {
        throw createError({ statusCode: 400, statusMessage: 'ID tenant tidak valid' })
    }
    const { id: tenantId } = params.data

    const body = await readBody(event)
    const parsed = assignSchema.safeParse(body)
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Input tidak valid',
            data: parsed.error.flatten(),
        })
    }
    const { roomId, startDate } = parsed.data

    // Guard 1: tenant tidak boleh sudah punya tenancy ACTIVE
    const tenantActive = await prisma.tenancy.findFirst({
        where: { tenantId, status: 'ACTIVE' },
        include: { room: { select: { roomNumber: true } } },
    })
    if (tenantActive) {
        throw createError({
            statusCode: 400,
            statusMessage: `Penyewa ini sudah menempati kamar ${tenantActive.room.roomNumber}. Akhiri sewa dulu sebelum assign ke kamar lain.`,
        })
    }

    // Guard 2: kamar tidak boleh sudah punya tenancy ACTIVE
    const roomActive = await prisma.tenancy.findFirst({
        where: { roomId, status: 'ACTIVE' },
    })
    if (roomActive) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Kamar ini sudah ditempati penyewa lain.',
        })
    }

    // Guard 3: kamar harus AVAILABLE
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) throw createError({ statusCode: 404, statusMessage: 'Kamar tidak ditemukan' })
    if (room.status !== 'AVAILABLE') {
        throw createError({
            statusCode: 400,
            statusMessage: `Kamar tidak bisa dipilih karena berstatus ${room.status}.`,
        })
    }

    // Buat tenancy + update status kamar dalam satu transaksi
    const tenancy = await prisma.$transaction(async (tx) => {
        const newTenancy = await tx.tenancy.create({
            data: {
                tenantId,
                roomId,
                startDate: new Date(startDate),
                status: 'ACTIVE',
            },
        })
        await tx.room.update({
            where: { id: roomId },
            data: { status: 'OCCUPIED' },
        })
        return newTenancy
    })

    await writeAuditLog({
        userId: user.id,
        action: 'TENANCY_STARTED',
        entityType: 'Tenancy',
        entityId: tenancy.id,
        metadata: { tenantId, roomId, roomNumber: room.roomNumber, startDate },
    })

    return { success: true, tenancyId: tenancy.id }
})
