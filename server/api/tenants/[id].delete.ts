// server/api/tenants/[id].delete.ts
import { tenantIdParamSchema } from '../../utils/validation/tenant'

export default defineEventHandler(async (event) => {
    const user = await requireOwner(event)

    const params = tenantIdParamSchema.safeParse({ id: getRouterParam(event, 'id') })
    if (!params.success) {
        throw createError({ statusCode: 400, statusMessage: 'ID tenant tidak valid' })
    }
    const { id } = params.data

    const existing = await prisma.tenant.findUnique({ where: { id } })
    if (!existing) {
        throw createError({ statusCode: 404, statusMessage: 'Tenant tidak ditemukan' })
    }

    // Guard: tolak hapus jika masih ada tenancy aktif
    const activeTenancy = await prisma.tenancy.findFirst({
        where: { tenantId: id, status: 'ACTIVE' },
        include: { room: { select: { roomNumber: true } } },
    })
    if (activeTenancy) {
        throw createError({
            statusCode: 400,
            statusMessage: `Tidak bisa hapus penyewa yang masih aktif di kamar ${activeTenancy.room.roomNumber}`,
        })
    }

    await prisma.tenant.delete({ where: { id } })

    await writeAuditLog({
        userId: user.id,
        action: 'TENANT_DELETED',
        entityType: 'Tenant',
        entityId: id,
        metadata: { fullName: existing.fullName, phone: existing.phone },
    })

    return { success: true }
})
