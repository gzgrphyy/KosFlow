/**
 * Normalize Indonesian phone number to international format (628xx...)
 * Handles: 08xxx, 628xxx, +628xxx, and with spaces/dashes
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  } else if (cleaned.startsWith('628')) {
    // already in 628 format — keep as is
  } else if (cleaned.startsWith('62')) {
    // already in 62 format — keep as is
  } else {
    cleaned = '62' + cleaned
  }

  return cleaned
}

/**
 * Calculate days overdue from due date to now
 */
export function calcDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  due.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diff = now.getTime() - due.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Generate the WhatsApp reminder message text based on invoice status
 */
export function generateWaReminderText(params: {
  tenantName: string
  roomNumber: string
  period: string
  dueDate: string
  total: number
  status: string
  paidAmount?: number
  remainingAmount?: number
  daysOverdue?: number
  refundedAmount?: number
}): string {
  const {
    tenantName,
    roomNumber,
    period,
    dueDate,
    total,
    status,
    paidAmount,
    remainingAmount,
    daysOverdue,
    refundedAmount,
  } = params

  const dueFormatted = new Date(dueDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Determine nominal to show
  let nominalText: string
  if (status === 'SEBAGIAN' && remainingAmount !== undefined && remainingAmount > 0) {
    nominalText = `Rp ${remainingAmount.toLocaleString('id-ID')} (sisa tagihan)`
  } else {
    nominalText = `Rp ${total.toLocaleString('id-ID')}`
  }

  // Status label
  const statusLabel: Record<string, string> = {
    BELUM_LUNAS: 'Belum Lunas',
    SEBAGIAN: 'Sebagian',
    TELAT: 'Telat',
    LUNAS: 'Lunas',
  }
  const statusDisplay = statusLabel[status] || status

  // Overdue info
  const overdueInfo =
    status === 'TELAT' && daysOverdue !== undefined && daysOverdue > 0
      ? `• Terlambat: ${daysOverdue} hari\n`
      : ''

  // Payment info — hanya tampil untuk status SEBAGIAN & belum ada refund
  const paymentInfo =
    status === 'SEBAGIAN' && paidAmount !== undefined && paidAmount > 0 && (!refundedAmount || refundedAmount <= 0)
      ? `• Sudah dibayar: Rp ${paidAmount.toLocaleString('id-ID')}\n`
      : ''

  // Refund info — tampil jika sudah ada pengembalian kelebihan dana (gantikan "Sudah dibayar")
  const refundInfo =
    refundedAmount !== undefined && refundedAmount > 0
      ? `• Kelebihan pembayaran Rp ${refundedAmount.toLocaleString('id-ID')} sudah dikembalikan\n`
      : ''

  return [
    `Halo ${tenantName},`,
    '',
    `Ini adalah pengingat untuk tagihan sewa kamar ${roomNumber} periode ${period}.`,
    '',
    'Detail tagihan:',
    `• Nominal: ${nominalText}`,
    `• Jatuh tempo: ${dueFormatted}`,
    `• Status: ${statusDisplay}`,
    overdueInfo ? `${overdueInfo}` : '',
    paymentInfo ? `${paymentInfo}` : '',
    refundInfo ? `${refundInfo}` : '',
    'Mohon segera dilakukan pembayaran. Terima kasih.',
    '',
    '— KosFlow',
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Generate a full WhatsApp URL (wa.me) with pre-filled message
 */
export function generateWaUrl(phone: string, text: string): string {
  const normalized = normalizePhone(phone)
  const encoded = encodeURIComponent(text)
  return `https://wa.me/${normalized}?text=${encoded}`
}
