import { z } from 'zod'
import ExcelJS from 'exceljs'

const querySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'E_WALLET', 'LAINNYA']).optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  roomId: z.string().optional(),
  tenantId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = await getValidatedQuery(event, querySchema.parse)

  const where: any = { status: 'VERIFIED' }

  if (query.dateFrom || query.dateTo) {
    where.paymentDate = {}
    if (query.dateFrom) where.paymentDate.gte = new Date(query.dateFrom)
    if (query.dateTo) where.paymentDate.lte = new Date(query.dateTo + 'T23:59:59.999Z')
  }

  if (query.period) {
    where.invoice = { period: query.period }
  }

  if (query.method) where.method = query.method
  if (query.status) where.status = query.status

  if (query.roomId || query.tenantId) {
    const tenancyFilter: any = {}
    if (query.roomId) tenancyFilter.roomId = query.roomId
    if (query.tenantId) tenancyFilter.tenantId = query.tenantId
    where.invoice = { ...(where.invoice || {}), tenancy: tenancyFilter }
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { paymentDate: 'desc' },
    include: {
      invoice: {
        include: {
          tenancy: {
            include: {
              tenant: { select: { fullName: true } },
              room: { select: { roomNumber: true } },
            },
          },
        },
      },
      verifiedBy: { select: { name: true } },
    },
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'KosFlow'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Riwayat Pembayaran')

  sheet.columns = [
    { header: 'ID Transaksi', key: 'id', width: 20 },
    { header: 'Tanggal', key: 'date', width: 16 },
    { header: 'Penyewa', key: 'tenant', width: 24 },
    { header: 'Kamar', key: 'room', width: 10 },
    { header: 'Periode Tagihan', key: 'period', width: 16 },
    { header: 'Nominal', key: 'amount', width: 16 },
    { header: 'Metode', key: 'method', width: 14 },
    { header: 'No. Referensi', key: 'reference', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Diverifikasi Oleh', key: 'verifiedBy', width: 20 },
  ]

  const statusLabel: Record<string, string> = {
    PENDING: 'Pending',
    VERIFIED: 'Terverifikasi',
    REJECTED: 'Ditolak',
  }

  const methodLabel: Record<string, string> = {
    CASH: 'Tunai',
    TRANSFER: 'Transfer',
    QRIS: 'QRIS',
    E_WALLET: 'E-Wallet',
    LAINNYA: 'Lainnya',
  }

  payments.forEach((p) => {
    sheet.addRow({
      id: p.id.slice(0, 8) + '...',
      date: p.paymentDate.toLocaleDateString('id-ID'),
      tenant: p.invoice.tenancy.tenant.fullName,
      room: p.invoice.tenancy.room.roomNumber,
      period: p.invoice.period,
      amount: Number(p.amount),
      method: methodLabel[p.method ?? ''] || p.method || '-',
      reference: p.referenceNo || '-',
      status: statusLabel[p.status] || p.status,
      verifiedBy: p.verifiedBy?.name || '-',
    })
  })

  sheet.getRow(1).font = { bold: true, size: 12 }
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' },
  }
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  const totalRow = sheet.addRow({
    id: 'TOTAL',
    amount: payments.reduce((s, p) => s + Number(p.amount), 0),
  })
  totalRow.getCell(6).font = { bold: true }

  sheet.getColumn(6).numFmt = '#,##0'

  const buffer = await workbook.xlsx.writeBuffer()

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="riwayat-pembayaran-${new Date().toISOString().slice(0, 10)}.xlsx"`)

  return buffer
})
