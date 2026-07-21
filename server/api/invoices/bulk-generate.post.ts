import { z } from 'zod'

const bodySchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Format period harus YYYY-MM').optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdminOrOwner(event)

  const body = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Input tidak valid', data: parsed.error.flatten() })
  }

  const now = new Date()
  const period = parsed.data.period || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [yearStr, monthStr] = period.split('-')
  if (!yearStr || !monthStr) throw createError({ statusCode: 400, statusMessage: 'Format periode tidak valid' })
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  const tenancies = await prisma.tenancy.findMany({
    where: { status: 'ACTIVE' },
    include: {
      tenant: { select: { id: true, fullName: true } },
      room: { select: { id: true, roomNumber: true, monthlyRate: true } },
    },
  })

  if (tenancies.length === 0) {
    return { created: 0, skipped: 0, errors: [], period, message: 'Tidak ada penyewa aktif untuk ditagih.' }
  }

  const existingInvoices = await prisma.invoice.findMany({
    where: { period },
    select: { tenancyId: true },
  })
  const existingTenancyIds = new Set(existingInvoices.map(inv => inv.tenancyId))

  const lastDayOfMonth = new Date(year, month, 0).getDate()
  const results: any[] = []
  let created = 0
  let skipped = 0
  const errors: { tenancyId: string; roomNumber: string; tenantName: string; error: string }[] = []

  for (const tenancy of tenancies) {
    if (existingTenancyIds.has(tenancy.id)) {
      skipped++
      results.push({ tenancyId: tenancy.id, roomNumber: tenancy.room.roomNumber, tenantName: tenancy.tenant.fullName, status: 'skipped', reason: 'duplicate' })
      continue
    }

    const startDay = tenancy.startDate.getDate()
    const clampedDay = Math.min(startDay, lastDayOfMonth)
    const dueDate = new Date(year, month - 1, clampedDay)

    try {
      const invoice = await prisma.$transaction(async (tx) => {
        const newInvoice = await tx.invoice.create({
          data: {
            tenancyId: tenancy.id,
            period,
            dueDate,
            status: 'BELUM_LUNAS',
            items: {
              create: {
                description: 'Sewa Kamar Bulanan',
                amount: tenancy.room.monthlyRate,
              },
            },
          },
          include: { items: true },
        })
        return newInvoice
      })

      const total = Number(tenancy.room.monthlyRate)

      await writeAuditLog({
        userId: user.id,
        action: 'INVOICE_BULK_CREATED',
        entityType: 'Invoice',
        entityId: invoice.id,
        metadata: {
          tenancyId: tenancy.id,
          period,
          roomNumber: tenancy.room.roomNumber,
          tenantName: tenancy.tenant.fullName,
          total,
          source: 'bulk_generate',
        },
      })

      created++
      results.push({
        tenancyId: tenancy.id,
        invoiceId: invoice.id,
        roomNumber: tenancy.room.roomNumber,
        tenantName: tenancy.tenant.fullName,
        total,
        dueDate,
        status: 'created',
      })
    } catch (e: any) {
      const msg = e.message || 'Gagal membuat tagihan'
      errors.push({ tenancyId: tenancy.id, roomNumber: tenancy.room.roomNumber, tenantName: tenancy.tenant.fullName, error: msg })
      results.push({ tenancyId: tenancy.id, roomNumber: tenancy.room.roomNumber, tenantName: tenancy.tenant.fullName, status: 'error', error: msg })
    }
  }

  return {
    created,
    skipped,
    errors,
    period,
    message: `Berhasil membuat ${created} tagihan. ${skipped} dilewati (sudah ada).${errors.length > 0 ? ` ${errors.length} gagal.` : ''}`,
    results,
  }
})
