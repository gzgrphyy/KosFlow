import { z } from 'zod'

const querySchema = z.object({
  months: z.coerce.number().int().min(1).max(12).default(6),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const { months } = await getValidatedQuery(event, querySchema.parse)

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  const payments = await prisma.payment.findMany({
    where: {
      status: 'VERIFIED',
      paymentDate: { gte: startDate },
    },
    select: {
      paymentDate: true,
      amount: true,
      refundedAmount: true,
    },
  })

  const monthLabels: string[] = []
  const cursor = new Date(startDate)
  while (cursor <= now) {
    const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    monthLabels.push(label)
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const monthMap = new Map<string, { gross: number; totalRefund: number; count: number }>()
  for (const p of payments) {
    const label = `${p.paymentDate.getFullYear()}-${String(p.paymentDate.getMonth() + 1).padStart(2, '0')}`
    const entry = monthMap.get(label) || { gross: 0, totalRefund: 0, count: 0 }
    entry.gross += Number(p.amount)
    entry.totalRefund += Number(p.refundedAmount || 0)
    entry.count++
    monthMap.set(label, entry)
  }

  const result = monthLabels.map((month) => {
    const entry = monthMap.get(month)
    const gross = entry?.gross ?? 0
    const totalRefund = entry?.totalRefund ?? 0
    return {
      month,
      gross,
      totalRefund,
      net: gross - totalRefund,
      transactionCount: entry?.count ?? 0,
    }
  })

  return result
})
