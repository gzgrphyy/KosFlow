// server/api/invoices/[id].get.ts
export default defineEventHandler(async (event) => {
    await requireAuth(event)

    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID invoice diperlukan' })

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            tenancy: {
                include: {
                    tenant: { select: { id: true, fullName: true, phone: true, email: true } },
                    room: { select: { id: true, roomNumber: true, monthlyRate: true } },
                },
            },
            items: { orderBy: { description: 'asc' } },
            payments: {
                orderBy: { createdAt: 'desc' },
                include: {
                    verifiedBy: { select: { id: true, name: true } },
                },
            },
        },
    })

    if (!invoice) {
        throw createError({ statusCode: 404, statusMessage: 'Invoice tidak ditemukan' })
    }

    const total = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0)

    return {
        id: invoice.id,
        period: invoice.period,
        dueDate: invoice.dueDate,
        status: invoice.status,
        createdAt: invoice.createdAt,
        tenant: invoice.tenancy.tenant,
        room: {
            ...invoice.tenancy.room,
            monthlyRate: Number(invoice.tenancy.room.monthlyRate),
        },
        tenancyId: invoice.tenancyId,
        items: invoice.items.map(item => ({ ...item, amount: Number(item.amount) })),
        total,
        payments: invoice.payments.map(p => ({
            id: p.id,
            amount: Number(p.amount),
            method: p.method,
            referenceNo: p.referenceNo,
            proofUrl: p.proofUrl,
            paymentDate: p.paymentDate,
            status: p.status,
            notes: p.notes,
            verifiedAt: p.verifiedAt,
            verifiedBy: p.verifiedBy,
            createdAt: p.createdAt,
        })),
    }
})
