<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/invoices" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Icon name="heroicons:arrow-left-20-solid" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Detail Tagihan</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Invoice #{{ invoice?.id?.slice(0, 8) }}</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
    </div>
    <UAlert v-else-if="loadError" color="error" variant="soft" :title="loadError" icon="heroicons:exclamation-circle-20-solid" />

    <template v-else>
      <UCard class="mb-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ invoice?.tenant?.fullName }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Kamar {{ invoice?.room?.roomNumber }}</p>
          </div>
          <UBadge :color="statusColor(invoice?.status)" variant="subtle" size="lg">
            {{ statusLabel(invoice?.status) }}
          </UBadge>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Periode</p>
            <p class="font-mono text-base text-gray-900 dark:text-white mt-1">{{ invoice?.period }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jatuh Tempo</p>
            <p class="text-base text-gray-900 dark:text-white mt-1">{{ formatDate(invoice?.dueDate) }}</p>
          </div>
        </div>

        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
              <th class="text-right pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="item in invoice?.items" :key="item.id">
              <td class="py-3 text-gray-700 dark:text-gray-300">{{ item.description }}</td>
              <td class="py-3 text-right text-gray-700 dark:text-gray-300">Rp {{ item.amount.toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-200 dark:border-gray-700">
              <td class="pt-3 font-bold text-gray-900 dark:text-white">Total</td>
              <td class="pt-3 text-right font-bold text-xl text-gray-900 dark:text-white">
                Rp {{ invoice?.total?.toLocaleString('id-ID') }}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Payment Summary -->
        <div class="border-t border-gray-100 dark:border-gray-800 pt-5 mt-5 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Total Dibayar</span>
            <span class="font-semibold text-green-600 dark:text-green-400">
              Rp {{ totalPaid.toLocaleString('id-ID') }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Total Dikembalikan</span>
            <span class="font-semibold text-red-600 dark:text-red-400">
              Rp {{ totalRefunded.toLocaleString('id-ID') }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Sisa Tagihan</span>
            <span class="font-semibold" :class="remainingAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'">
              Rp {{ remainingAmount.toLocaleString('id-ID') }}
            </span>
          </div>
        </div>

        <!-- Overpayment Alert -->
        <UAlert
          v-if="overpaymentAmount > 0"
          color="warning"
          variant="soft"
          icon="heroicons:banknotes-20-solid"
          class="mt-4"
        >
          <template #title>
            <span class="font-semibold">Kelebihan Pembayaran</span>
          </template>
          <template #description>
            <p class="text-sm">Pembayaran melebihi tagihan sebesar <strong>Rp {{ overpaymentAmount.toLocaleString('id-ID') }}</strong>. Jangan lupa kembalikan kelebihan ini ke penyewa.</p>
          </template>
        </UAlert>

        <!-- Catat Pembayaran Button -->
        <div v-if="invoice?.status !== 'LUNAS'" class="mt-5">
          <UButton color="primary" variant="solid" size="md" @click="paymentPanelOpen = true" class="w-full">
            <Icon name="heroicons:plus-20-solid" class="w-4 h-4" />
            Catat Pembayaran
          </UButton>
        </div>
        <div v-else class="mt-5">
          <UButton color="green" variant="soft" size="md" disabled class="w-full">
            <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4" />
            Tagihan Lunas
          </UButton>
        </div>

        <div class="border-t border-gray-100 dark:border-gray-800 pt-5 mt-5">
          <div class="flex items-center gap-2 mb-3">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Update Status</p>
            <span class="text-[10px] text-gray-400 dark:text-gray-500 italic">(override manual)</span>
          </div>
          <div class="flex gap-3 items-center">
            <USelect v-model="newStatus" :items="statusOptions" class="w-44" />
            <UButton :loading="updatingStatus" :disabled="newStatus === invoice?.status" @click="handleUpdateStatus" color="primary">
              {{ updatingStatus ? 'Menyimpan...' : 'Simpan Status' }}
            </UButton>
          </div>
          <UAlert v-if="statusError" color="error" variant="soft" :title="statusError" icon="heroicons:exclamation-circle-20-solid" class="mt-3" />
          <UAlert v-if="statusSuccess" color="success" variant="soft" :title="statusSuccess" icon="heroicons:check-circle-20-solid" class="mt-3" />
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Riwayat Pembayaran</p>
          </div>
        </template>

        <div v-if="!invoice?.payments?.length" class="text-center py-8">
          <Icon name="heroicons:banknotes-20-solid" class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada pembayaran</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="p in invoice.payments" :key="p.id"
            class="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Rp {{ Number(p.amount).toLocaleString('id-ID') }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ formatDate(p.paymentDate) }}
                  <span class="text-gray-400">·</span>
                  {{ methodLabel(p.method) }}
                </p>
                <p v-if="p.referenceNo" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">Ref: {{ p.referenceNo }}</p>
                <p v-if="p.notes" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ p.notes }}</p>
              </div>
              <div class="flex flex-col items-end gap-1.5">
                <UBadge :color="paymentColor(p.status)" variant="subtle" size="sm">
                  {{ paymentLabel(p.status) }}
                </UBadge>
                <a v-if="p.proofUrl" :href="p.proofUrl" target="_blank" class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400">
                  Lihat Bukti
                </a>
              </div>
            </div>
            <div v-if="p.refundedAmount > 0" class="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-red-600 dark:text-red-400 font-medium">
                  Rp {{ Number(p.refundedAmount).toLocaleString('id-ID') }} telah dikembalikan
                </span>
                <span v-if="p.refundedBy" class="text-xs text-gray-400 dark:text-gray-500">
                  oleh {{ p.refundedBy.name }} · {{ formatDate(p.refundedAt) }}
                </span>
              </div>
              <p v-if="p.refundNote" class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ p.refundNote }}</p>
            </div>
            <div v-if="canRefundPayment(p)" class="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
              <UButton color="orange" variant="soft" size="xs" @click="openRefundModal(p)">
                <Icon name="heroicons:arrow-uturn-left-20-solid" class="w-3.5 h-3.5" />
                Tandai Sudah Dikembalikan
              </UButton>
            </div>
            <div v-if="p.verifiedBy" class="text-xs text-gray-400 dark:text-gray-500 mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
              Diverifikasi oleh {{ p.verifiedBy.name }} pada {{ formatDate(p.verifiedAt) }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Catat Pembayaran Modal -->
      <div v-if="paymentPanelOpen">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Catat Pembayaran</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-6 font-mono">
            Invoice #{{ invoice?.id?.slice(0, 8) }} — {{ invoice?.tenant?.fullName }}
          </p>

          <div class="space-y-5">
            <UFormField label="Jumlah Dibayar" required>
              <input
                v-model="paymentForm.amount"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
              />
            </UFormField>

            <UFormField label="Metode Bayar" required>
              <select
                v-model="paymentForm.method"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
              >
                <option value="" disabled>Pilih metode</option>
                <option value="CASH">Tunai</option>
                <option value="TRANSFER">Transfer</option>
                <option value="QRIS">QRIS</option>
                <option value="E_WALLET">E-Wallet</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </UFormField>

            <UFormField label="Tanggal Bayar" required>
              <input
                v-model="paymentForm.paymentDate"
                type="date"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
              />
            </UFormField>

            <UFormField label="Upload Bukti">
              <label class="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Icon name="heroicons:cloud-arrow-up-20-solid" class="w-5 h-5 text-gray-400 shrink-0" />
                <span class="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                  {{ paymentForm.proofFile ? paymentForm.proofFile.name : 'Pilih file...' }}
                </span>
                <input type="file" accept="image/*,.pdf" class="hidden" @change="onFileChange" />
              </label>
              <p class="text-xs text-gray-400 mt-1">Opsional (disarankan untuk non-tunai)</p>
            </UFormField>

            <UFormField label="Catatan">
              <textarea
                v-model="paymentForm.notes"
                placeholder="Keterangan tambahan..."
                maxlength="500"
                rows="3"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none resize-none"
              ></textarea>
            </UFormField>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6">
            <UButton color="gray" variant="ghost" @click="closePaymentPanel">Batal</UButton>
            <UButton :loading="submittingPayment" color="primary" @click="handleSubmitPayment">
              {{ submittingPayment ? 'Menyimpan...' : 'Simpan Pembayaran' }}
            </UButton>
          </div>

          <p v-if="paymentError" class="text-sm text-red-600 dark:text-red-400 mt-4">{{ paymentError }}</p>
        </div>
      </div>

      <!-- Refund Modal -->
      <div v-if="refundPanelOpen">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Tandai Sudah Dikembalikan</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-6 font-mono">
            Pembayaran Rp {{ Number(refundTarget?.amount || 0).toLocaleString('id-ID') }} — {{ invoice?.tenant?.fullName }}
          </p>

          <div class="space-y-5">
            <UFormField label="Jumlah Dikembalikan" required>
              <input
                v-model="refundForm.amount"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
              />
              <p class="text-xs text-gray-400 mt-1">Maksimal Rp {{ maxRefundable.toLocaleString('id-ID') }}</p>
            </UFormField>

            <UFormField label="Catatan">
              <textarea
                v-model="refundForm.notes"
                placeholder="Keterangan refund..."
                maxlength="500"
                rows="3"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none resize-none"
              ></textarea>
            </UFormField>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6">
            <UButton color="gray" variant="ghost" @click="closeRefundPanel">Batal</UButton>
            <UButton :loading="submittingRefund" color="orange" @click="handleSubmitRefund">
              {{ submittingRefund ? 'Menyimpan...' : 'Konfirmasi Refund' }}
            </UButton>
          </div>

          <p v-if="refundError" class="text-sm text-red-600 dark:text-red-400 mt-4">{{ refundError }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id

const invoice = ref(null)
const loading = ref(true)
const loadError = ref('')
const newStatus = ref('')
const updatingStatus = ref(false)
const statusError = ref('')
const statusSuccess = ref('')

const statusOptions = [
  { label: 'Belum Lunas', value: 'BELUM_LUNAS' },
  { label: 'Sebagian', value: 'SEBAGIAN' },
  { label: 'Lunas', value: 'LUNAS' },
  { label: 'Telat', value: 'TELAT' },
]

async function loadInvoice() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await $fetch(`/api/invoices/${id}`)
    invoice.value = data
    newStatus.value = data.status
  } catch (e) {
    loadError.value = e.data?.statusMessage || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

onMounted(loadInvoice)

async function handleUpdateStatus() {
  statusError.value = ''
  statusSuccess.value = ''
  updatingStatus.value = true
  try {
    await $fetch(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      body: { status: newStatus.value },
    })
    statusSuccess.value = 'Status berhasil diupdate'
    await loadInvoice()
  } catch (e) {
    statusError.value = e.data?.statusMessage || 'Gagal update status'
  } finally {
    updatingStatus.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const totalPaid = computed(() =>
  (invoice.value?.payments || [])
    .filter(p => p.status === 'VERIFIED')
    .reduce((s, p) => s + Number(p.amount), 0)
)

const totalRefunded = computed(() =>
  (invoice.value?.payments || [])
    .filter(p => p.status === 'VERIFIED')
    .reduce((s, p) => s + Number(p.refundedAmount || 0), 0)
)

const overpaymentAmount = computed(() =>
  Math.max(0, totalPaid.value - (invoice.value?.total || 0) - totalRefunded.value)
)

const remainingAmount = computed(() =>
  Math.max(0, (invoice.value?.total || 0) - totalPaid.value + totalRefunded.value)
)

function statusLabel(s) {
  return { BELUM_LUNAS: 'Belum Lunas', SEBAGIAN: 'Sebagian', LUNAS: 'Lunas', TELAT: 'Telat' }[s] || s
}

function statusColor(s) {
  return { BELUM_LUNAS: 'warning', SEBAGIAN: 'neutral', LUNAS: 'success', TELAT: 'error' }[s] || 'neutral'
}

function paymentLabel(s) {
  return { PENDING: 'Menunggu', VERIFIED: 'Terverifikasi', REJECTED: 'Ditolak' }[s] || s
}

function paymentColor(s) {
  return { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'error' }[s] || 'neutral'
}

function methodLabel(m) {
  return { CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS', E_WALLET: 'E-Wallet', LAINNYA: 'Lainnya' }[m] || m || '—'
}

// Payment Modal
const paymentPanelOpen = ref(false)
const submittingPayment = ref(false)
const paymentError = ref('')

const todayStr = new Date().toISOString().slice(0, 10)

const paymentForm = reactive({
  amount: '',
  method: '',
  paymentDate: todayStr,
  proofFile: null,
  notes: '',
})

function onFileChange(event) {
  paymentForm.proofFile = event.target.files?.[0] || null
}

function closePaymentPanel() {
  paymentPanelOpen.value = false
  paymentError.value = ''
  paymentForm.amount = ''
  paymentForm.method = ''
  paymentForm.paymentDate = todayStr
  paymentForm.proofFile = null
  paymentForm.notes = ''
}

async function handleSubmitPayment() {
  paymentError.value = ''
  const amountNum = Number(paymentForm.amount)
  if (!amountNum || amountNum <= 0) {
    paymentError.value = 'Jumlah dibayar harus lebih dari 0'
    return
  }
  if (!paymentForm.method) {
    paymentError.value = 'Pilih metode pembayaran'
    return
  }

  submittingPayment.value = true
  try {
    const fd = new FormData()
    fd.append('invoiceId', id)
    fd.append('amount', paymentForm.amount)
    fd.append('method', paymentForm.method)
    fd.append('paymentDate', paymentForm.paymentDate)
    if (paymentForm.notes) fd.append('notes', paymentForm.notes)
    if (paymentForm.proofFile) fd.append('proof', paymentForm.proofFile)

    await $fetch('/api/payments/upload', {
      method: 'POST',
      body: fd,
    })

    closePaymentPanel()
    await loadInvoice()
  } catch (e) {
    paymentError.value = e.data?.statusMessage || 'Gagal mencatat pembayaran'
  } finally {
    submittingPayment.value = false
  }
}

// Refund
const refundPanelOpen = ref(false)
const submittingRefund = ref(false)
const refundError = ref('')
const refundTarget = ref(null)

const refundForm = reactive({
  amount: '',
  notes: '',
})

const maxRefundable = computed(() => {
  if (!refundTarget.value) return 0
  const amount = Number(refundTarget.value.amount)
  const alreadyRefunded = Number(refundTarget.value.refundedAmount || 0)
  return amount - alreadyRefunded
})

function canRefundPayment(p) {
  if (p.status !== 'VERIFIED') return false
  const alreadyRefunded = Number(p.refundedAmount || 0)
  return alreadyRefunded < Number(p.amount)
}

function openRefundModal(p) {
  refundTarget.value = p
  refundForm.amount = String(overpaymentAmount.value > 0 ? Math.min(overpaymentAmount.value, maxRefundable.value) : maxRefundable.value)
  refundForm.notes = ''
  refundError.value = ''
  refundPanelOpen.value = true
}

function closeRefundPanel() {
  refundPanelOpen.value = false
  refundTarget.value = null
  refundForm.amount = ''
  refundForm.notes = ''
  refundError.value = ''
}

async function handleSubmitRefund() {
  refundError.value = ''
  const amountNum = Number(refundForm.amount)
  if (!amountNum || amountNum <= 0) {
    refundError.value = 'Jumlah refund harus lebih dari 0'
    return
  }
  if (amountNum > maxRefundable.value) {
    refundError.value = `Jumlah refund tidak boleh melebihi Rp ${maxRefundable.value.toLocaleString('id-ID')}`
    return
  }

  submittingRefund.value = true
  try {
    await $fetch(`/api/payments/${refundTarget.value.id}/refund`, {
      method: 'POST',
      body: { amount: amountNum, notes: refundForm.notes || undefined },
    })
    closeRefundPanel()
    await loadInvoice()
  } catch (e) {
    refundError.value = e.data?.statusMessage || 'Gagal mencatat refund'
  } finally {
    submittingRefund.value = false
  }
}
</script>


