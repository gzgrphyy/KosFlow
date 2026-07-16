// server/api/tenants/index.get.ts
import { z } from 'zod'

const querySchema = z.object({
    search: z.string().optional(),
})

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    const query = await getValidatedQuery(event, querySchema.parse)

    const tenants = await prisma.tenant.findMany({
        where: query.search
            ? {
                OR: [
                    { fullName: { contains: query.search, mode: 'insensitive' } },
                    { phone: { contains: query.search } },
                ],
            }
            : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            tenancies: {
                where: { status: 'ACTIVE' },
                include: {
                    room: { select: { id: true, roomNumber: true } },
                },
                take: 1,
            },
        },
    })

    return tenants.map(t => ({
        id: t.id,
        fullName: t.fullName,
        phone: t.phone,
        email: t.email,
        ktpMasked: maskKtp(decryptKtp(t.ktpEncrypted)),
        activeRoom: t.tenancies[0]?.room ?? null,
        createdAt: t.createdAt,
    }))
})
