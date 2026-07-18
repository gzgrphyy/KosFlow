// server/api/invoices/[id]/status.patch.ts
import { z } from 'zod'

const updateStatusSchema = z.object({
    status: z.enum(['BELUM_LUNAS', 'LUNAS', 'TELAT']),
})

export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID invoice diperlukan' })

    const body = await readBody(event)
    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Status tidak valid. Pilihan: BELUM_LUNAS, LUNAS, TELAT',
        })
    }

    const existing = await prisma.invoice.findUnique({
        where: { id },
        include: {
            tenancy: {
                include: {
                    tenant: { select: { fullName: true } },
                    room: { select: { roomNumber: true } },
                },
            },
        },
    })
    if (!existing) {
        throw createError({ statusCode: 404, statusMessage: 'Invoice tidak ditemukan' })
    }

    const updated = await prisma.invoice.update({
        where: { id },
        data: { status: parsed.data.status },
    })

    await writeAuditLog({
        userId: user.id,
        action: 'INVOICE_STATUS_UPDATED',
        entityType: 'Invoice',
        entityId: id,
        metadata: {
            period: existing.period,
            roomNumber: existing.tenancy.room.roomNumber,
            tenantName: existing.tenancy.tenant.fullName,
            oldStatus: existing.status,
            newStatus: parsed.data.status,
        },
    })

    return { id: updated.id, status: updated.status }
})
