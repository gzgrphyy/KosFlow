// server/api/invoices/index.get.ts
import { z } from 'zod'

const querySchema = z.object({
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Format period harus YYYY-MM').optional(),
    status: z.enum(['BELUM_LUNAS', 'LUNAS', 'TELAT']).optional(),
})

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    const query = await getValidatedQuery(event, querySchema.parse)

    const invoices = await prisma.invoice.findMany({
        where: {
            ...(query.period ? { period: query.period } : {}),
            ...(query.status ? { status: query.status } : {}),
        },
        orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
        include: {
            tenancy: {
                include: {
                    tenant: { select: { id: true, fullName: true, phone: true } },
                    room: { select: { id: true, roomNumber: true } },
                },
            },
            items: { select: { id: true, description: true, amount: true } },
        },
    })

    return invoices.map(inv => ({
        id: inv.id,
        period: inv.period,
        dueDate: inv.dueDate,
        status: inv.status,
        createdAt: inv.createdAt,
        tenant: inv.tenancy.tenant,
        room: inv.tenancy.room,
        tenancyId: inv.tenancyId,
        items: inv.items.map(item => ({ ...item, amount: Number(item.amount) })),
        total: inv.items.reduce((sum, item) => sum + Number(item.amount), 0),
    }))
})
