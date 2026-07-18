// server/api/tenants/[id].delete.ts

export default defineEventHandler(async (event) => {
    const user = await requireOwner(event)

    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID tenant tidak valid' })

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

    // Hapus semua data terkait dalam transaksi (cascade manual)
    await prisma.$transaction(async (tx) => {
        const tenancyIds = await tx.tenancy.findMany({
            where: { tenantId: id },
            select: { id: true },
        }).then(rows => rows.map(r => r.id))

        if (tenancyIds.length > 0) {
            const invoiceIds = await tx.invoice.findMany({
                where: { tenancyId: { in: tenancyIds } },
                select: { id: true },
            }).then(rows => rows.map(r => r.id))

            if (invoiceIds.length > 0) {
                await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
                await tx.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
                await tx.invoice.deleteMany({ where: { id: { in: invoiceIds } } })
            }

            await tx.tenancy.deleteMany({ where: { id: { in: tenancyIds } } })
        }

        await tx.tenant.delete({ where: { id } })
    })

    await writeAuditLog({
        userId: user.id,
        action: 'TENANT_DELETED',
        entityType: 'Tenant',
        entityId: id,
        metadata: { fullName: existing.fullName, phone: existing.phone },
    })

    return { success: true }
})
