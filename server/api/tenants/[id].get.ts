// server/api/tenants/[id].get.ts
import { tenantIdParamSchema } from '../../utils/validation/tenant'

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    const params = tenantIdParamSchema.safeParse({ id: getRouterParam(event, 'id') })
    if (!params.success) {
        throw createError({ statusCode: 400, statusMessage: 'ID tenant tidak valid' })
    }
    const { id } = params.data

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            tenancies: {
                orderBy: { startDate: 'desc' },
                include: {
                    room: { select: { id: true, roomNumber: true, monthlyRate: true } },
                },
            },
        },
    })

    if (!tenant) {
        throw createError({ statusCode: 404, statusMessage: 'Tenant tidak ditemukan' })
    }

    return {
        id: tenant.id,
        fullName: tenant.fullName,
        phone: tenant.phone,
        email: tenant.email,
        ktpMasked: maskKtp(decryptKtp(tenant.ktpEncrypted)),
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        tenancies: tenant.tenancies.map(t => ({
            id: t.id,
            status: t.status,
            startDate: t.startDate,
            endDate: t.endDate,
            room: {
                ...t.room,
                monthlyRate: Number(t.room.monthlyRate),
            },
        })),
    }
})
