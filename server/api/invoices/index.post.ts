// server/api/invoices/index.post.ts
import { z } from 'zod'

const invoiceItemSchema = z.object({
    description: z.string().min(1, 'Deskripsi item wajib diisi').max(200),
    amount: z.number().positive('Jumlah harus lebih dari 0'),
})

const createInvoiceSchema = z.object({
    tenancyId: z.string().min(1, 'ID tenancy diperlukan'),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Format period harus YYYY-MM'),
    dueDate: z.string().refine(v => !isNaN(Date.parse(v)), 'Format tanggal jatuh tempo tidak valid'),
    items: z.array(invoiceItemSchema).min(1, 'Minimal harus ada 1 item tagihan'),
})

export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const body = await readBody(event)
    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Input tidak valid',
            data: parsed.error.flatten(),
        })
    }

    const { tenancyId, period, dueDate, items } = parsed.data

    // Guard 1: tenancy harus ada dan ACTIVE
    const tenancy = await prisma.tenancy.findUnique({
        where: { id: tenancyId },
        include: {
            tenant: { select: { fullName: true } },
            room: { select: { roomNumber: true } },
        },
    })
    if (!tenancy) {
        throw createError({ statusCode: 404, statusMessage: 'Tenancy tidak ditemukan' })
    }
    if (tenancy.status !== 'ACTIVE') {
        throw createError({ statusCode: 400, statusMessage: 'Tidak bisa buat tagihan untuk sewa yang sudah berakhir' })
    }

    // Guard 2: cek duplikat (tenancyId + period) — satu tagihan per bulan
    const existing = await prisma.invoice.findUnique({
        where: { tenancyId_period: { tenancyId, period } },
    })
    if (existing) {
        throw createError({
            statusCode: 409,
            statusMessage: `Tagihan periode ${period} untuk kamar ${tenancy.room.roomNumber} sudah ada.`,
        })
    }

    // Buat invoice + semua items dalam satu transaksi
    const invoice = await prisma.$transaction(async (tx) => {
        const newInvoice = await tx.invoice.create({
            data: {
                tenancyId,
                period,
                dueDate: new Date(dueDate),
                status: 'BELUM_LUNAS',
                items: {
                    create: items.map(item => ({
                        description: item.description,
                        amount: item.amount,
                    })),
                },
            },
            include: { items: true },
        })
        return newInvoice
    })

    const total = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0)

    await writeAuditLog({
        userId: user.id,
        action: 'INVOICE_CREATED',
        entityType: 'Invoice',
        entityId: invoice.id,
        metadata: {
            tenancyId,
            period,
            roomNumber: tenancy.room.roomNumber,
            tenantName: tenancy.tenant.fullName,
            total,
            itemCount: items.length,
        },
    })

    return {
        id: invoice.id,
        period: invoice.period,
        dueDate: invoice.dueDate,
        status: invoice.status,
        items: invoice.items.map(item => ({ ...item, amount: Number(item.amount) })),
        total,
    }
})
