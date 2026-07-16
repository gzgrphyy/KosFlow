// server/api/tenants/[id].ktp.get.ts
// Endpoint khusus untuk melihat nomor KTP asli.
// Setiap akses WAJIB dicatat di audit log.
import { tenantIdParamSchema } from '../../utils/validation/tenant'

export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const params = tenantIdParamSchema.safeParse({ id: getRouterParam(event, 'id') })
    if (!params.success) {
        throw createError({ statusCode: 400, statusMessage: 'ID tenant tidak valid' })
    }
    const { id } = params.data

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        select: { id: true, fullName: true, ktpEncrypted: true },
    })
    if (!tenant) {
        throw createError({ statusCode: 404, statusMessage: 'Tenant tidak ditemukan' })
    }

    const ktpPlain = decryptKtp(tenant.ktpEncrypted)

    // Audit log wajib — setiap akses KTP harus tercatat
    await writeAuditLog({
        userId: user.id,
        action: 'KTP_ACCESSED',
        entityType: 'Tenant',
        entityId: id,
        metadata: {
            tenantName: tenant.fullName,
            accessedAt: new Date().toISOString(),
        },
    })

    return {
        tenantId: id,
        tenantName: tenant.fullName,
        ktpNumber: ktpPlain,
    }
})
