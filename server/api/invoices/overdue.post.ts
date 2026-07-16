// server/api/invoices/overdue.post.ts
// Tandai semua invoice yang sudah lewat jatuh tempo (dueDate < hari ini)
// dan masih berstatus BELUM_LUNAS → ubah ke TELAT
export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const today = new Date()
    today.setHours(0, 0, 0, 0) // mulai dari awal hari ini

    const result = await prisma.invoice.updateMany({
        where: {
            status: 'BELUM_LUNAS',
            dueDate: { lt: today },
        },
        data: { status: 'TELAT' },
    })

    await writeAuditLog({
        userId: user.id,
        action: 'INVOICES_MARKED_OVERDUE',
        entityType: 'Invoice',
        entityId: 'bulk',
        metadata: {
            updatedCount: result.count,
            checkedAt: today.toISOString(),
        },
    })

    return {
        success: true,
        updatedCount: result.count,
        message: result.count > 0
            ? `${result.count} tagihan ditandai TELAT.`
            : 'Tidak ada tagihan yang perlu ditandai TELAT.',
    }
})
