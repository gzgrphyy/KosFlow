// server/api/tenants/[id]/endtenancy.post.ts
import { z } from 'zod'

const endTenancySchema = z.object({
    tenancyId: z.string().min(1, 'ID tenancy diperlukan'),
    endDate: z.string().refine(v => !isNaN(Date.parse(v)), 'Format tanggal tidak valid'),
})

export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID tenant tidak valid' })
    const tenantId = id

    const body = await readBody(event)
    const parsed = endTenancySchema.safeParse(body)
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Input tidak valid',
            data: parsed.error.flatten(),
        })
    }
    const { tenancyId, endDate } = parsed.data

    // Guard: tenancy harus milik tenant ini dan masih ACTIVE
    const tenancy = await prisma.tenancy.findFirst({
        where: { id: tenancyId, tenantId, status: 'ACTIVE' },
        include: { room: { select: { id: true, roomNumber: true } } },
    })
    if (!tenancy) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Tenancy aktif tidak ditemukan untuk penyewa ini.',
        })
    }

    // Akhiri tenancy + kembalikan kamar ke AVAILABLE dalam satu transaksi
    await prisma.$transaction(async (tx) => {
        await tx.tenancy.update({
            where: { id: tenancyId },
            data: { status: 'ENDED', endDate: new Date(endDate) },
        })
        await tx.room.update({
            where: { id: tenancy.room.id },
            data: { status: 'AVAILABLE' },
        })
    })

    await writeAuditLog({
        userId: user.id,
        action: 'TENANCY_ENDED',
        entityType: 'Tenancy',
        entityId: tenancyId,
        metadata: {
            tenantId,
            roomId: tenancy.room.id,
            roomNumber: tenancy.room.roomNumber,
            endDate,
        },
    })

    return { success: true }
})
