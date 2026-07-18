import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'E_WALLET', 'LAINNYA']).optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  roomId: z.string().optional(),
  tenantId: z.string().optional(),
  sortBy: z.enum(['paymentDate', 'amount', 'tenantName']).default('paymentDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = await getValidatedQuery(event, querySchema.parse)

  const where: any = {}

  if (query.search) {
    const s = query.search
    where.OR = [
      { id: { contains: s, mode: 'insensitive' } },
      { invoice: { tenancy: { tenant: { fullName: { contains: s, mode: 'insensitive' } } } } },
      { invoice: { tenancy: { room: { roomNumber: { contains: s, mode: 'insensitive' } } } } },
    ]
  }

  if (query.dateFrom || query.dateTo) {
    where.paymentDate = {}
    if (query.dateFrom) where.paymentDate.gte = new Date(query.dateFrom)
    if (query.dateTo) where.paymentDate.lte = new Date(query.dateTo + 'T23:59:59.999Z')
  }

  if (query.period) {
    where.invoice = { ...(where.invoice || {}), period: query.period }
  }

  if (query.method) where.method = query.method
  if (query.status) where.status = query.status

  if (query.roomId || query.tenantId) {
    const tenancyFilter: any = {}
    if (query.roomId) tenancyFilter.roomId = query.roomId
    if (query.tenantId) tenancyFilter.tenantId = query.tenantId
    where.invoice = { ...(where.invoice || {}), tenancy: tenancyFilter }
  }

  const orderBy: any = {}
  if (query.sortBy === 'tenantName') {
    orderBy.invoice = { tenancy: { tenant: { fullName: query.sortOrder } } }
  } else {
    orderBy[query.sortBy] = query.sortOrder
  }

  const [data, total, statsRaw] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        invoice: {
          include: {
            items: { select: { amount: true } },
            tenancy: {
              include: {
                tenant: { select: { id: true, fullName: true, phone: true } },
                room: { select: { id: true, roomNumber: true } },
              },
            },
          },
        },
        verifiedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      _count: true,
      _sum: { amount: true },
      where: { status: 'VERIFIED' },
    }),
  ])

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const [thisMonthRevenue, todayRevenue] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'VERIFIED', invoice: { period: month } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'VERIFIED', paymentDate: { gte: todayStart, lt: todayEnd } },
    }),
  ])

  const totalRevenue = Number(statsRaw._sum.amount ?? 0)

  const mapped = data.map(p => {
    const totalInvoice = p.invoice.items.reduce((s, i) => s + Number(i.amount), 0)
    return {
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      referenceNo: p.referenceNo,
      proofUrl: p.proofUrl,
      paymentDate: p.paymentDate,
      status: p.status,
      notes: p.notes,
      verifiedAt: p.verifiedAt,
      createdAt: p.createdAt,
      invoice: {
        id: p.invoice.id,
        period: p.invoice.period,
        total: totalInvoice,
      },
      tenant: p.invoice.tenancy.tenant,
      room: p.invoice.tenancy.room,
      verifiedBy: p.verifiedBy,
    }
  })

  return {
    data: mapped,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
    stats: {
      totalTransactions: statsRaw._count,
      totalRevenue,
      thisMonthRevenue: Number(thisMonthRevenue._sum.amount ?? 0),
      todayRevenue: Number(todayRevenue._sum.amount ?? 0),
    },
  }
})
