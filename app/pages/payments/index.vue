<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Pembayaran</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Daftar seluruh transaksi pembayaran yang telah diterima.</p>
    </div>

    <!-- Stats Cards -->
    <div v-if="!loadingStats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div v-for="card in statCards" :key="card.label"
        class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-xl" :class="card.bgColor">
            <Icon :name="card.icon" class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ card.label }}</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <UInput v-model="filters.search" placeholder="Cari transaksi..." class="w-56" @update:model-value="onSearchChange">
          <template #trailing>
            <Icon name="lucide:search" class="w-4 h-4 text-gray-400" />
          </template>
        </UInput>

        <div class="flex items-center gap-2">
          <UInput v-model="filters.dateFrom" type="date" class="w-36" />
          <span class="text-xs text-gray-400">—</span>
          <UInput v-model="filters.dateTo" type="date" class="w-36" />
        </div>

        <UInput v-model="filters.period" type="month" class="w-40" />

        <USelect v-model="filters.method" :items="methodOptions" class="w-36" />

        <USelect v-model="filters.status" :items="statusFilterOptions" class="w-44" />

        <USelect v-model="filters.roomId" :items="roomOptions" class="w-32" />

        <div class="flex-1" />

        <UButton color="primary" variant="soft" :loading="exporting" @click="handleExport">
          <Icon name="lucide:file-down" class="w-4 h-4" /> Export Excel
        </UButton>
      </div>
    </UCard>

    <!-- Loading State -->
    <UCard v-if="loading">
      <div class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-14 w-full rounded-xl" />
      </div>
    </UCard>

    <!-- Empty State -->
    <UCard v-else-if="payments.length === 0">
      <div class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Icon name="lucide:wallet" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-base font-medium text-gray-900 dark:text-white mb-1">Belum ada transaksi</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada transaksi pembayaran yang tercatat.</p>
      </div>
    </UCard>

    <!-- Table -->
    <UCard v-else class="overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300" @click="toggleSort('paymentDate')">
              <div class="flex items-center gap-1">
                Tanggal
                <Icon v-if="sortBy === 'paymentDate'" :name="sortOrder === 'desc' ? 'lucide:arrow-down' : 'lucide:arrow-up'" class="w-3 h-3" />
              </div>
            </th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Transaksi</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300" @click="toggleSort('tenantName')">
              <div class="flex items-center gap-1">
                Penyewa
                <Icon v-if="sortBy === 'tenantName'" :name="sortOrder === 'desc' ? 'lucide:arrow-down' : 'lucide:arrow-up'" class="w-3 h-3" />
              </div>
            </th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kamar</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Periode</th>
            <th class="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300" @click="toggleSort('amount')">
              <div class="flex items-center justify-end gap-1">
                Nominal
                <Icon v-if="sortBy === 'amount'" :name="sortOrder === 'desc' ? 'lucide:arrow-down' : 'lucide:arrow-up'" class="w-3 h-3" />
              </div>
            </th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metode</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verifikator</th>
            <th class="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="p in payments" :key="p.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            @click="openDetail(p.id)">
            <td class="px-6 py-4">
              <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">{{ formatDate(p.paymentDate) }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">#{{ p.id.slice(0, 8) }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ p.tenant.fullName }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ p.room.roomNumber }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm font-mono text-gray-600 dark:text-gray-400">{{ p.invoice.period }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <span class="text-sm font-semibold text-gray-900 dark:text-white">Rp {{ Number(p.amount).toLocaleString('id-ID') }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ methodLabel(p.method) }}</span>
            </td>
            <td class="px-6 py-4">
              <UBadge :color="statusColor(p.status)" variant="subtle" size="sm">
                {{ statusLabel(p.status) }}
              </UBadge>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ p.verifiedBy?.name || '—' }}</span>
            </td>
            <td class="px-6 py-4 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <UTooltip v-if="p.status === 'PENDING'" text="Verifikasi" :delay-duration="300">
                  <UButton icon="lucide:check-circle" color="success" variant="ghost" size="sm" @click="openVerify(p)" />
                </UTooltip>
                <UTooltip text="Detail" :delay-duration="300">
                  <UButton icon="lucide:eye" color="gray" variant="ghost" size="sm" @click="openDetail(p.id)" />
                </UTooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Menampilkan {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, total) }} dari {{ total }} transaksi
        </p>
        <div class="flex items-center gap-1">
          <UButton icon="lucide:chevron-left" color="gray" variant="ghost" size="sm" :disabled="page <= 1" @click="page--" />
          <template v-for="p in visiblePages" :key="p">
            <UButton v-if="p === '...'" color="gray" variant="ghost" size="sm" disabled>...</UButton>
            <UButton v-else :color="p === page ? 'primary' : 'gray'" :variant="p === page ? 'solid' : 'ghost'" size="sm" @click="page = p">
              {{ p }}
            </UButton>
          </template>
          <UButton icon="lucide:chevron-right" color="gray" variant="ghost" size="sm" :disabled="page >= totalPages" @click="page++" />
        </div>
      </div>
    </UCard>

    <!-- Detail Drawer (inline, no teleport) -->
    <div v-if="drawerOpen" class="drawer-overlay" @click.self="closeDrawer">
      <div class="drawer-panel">
        <div v-if="detailLoading" class="p-6 space-y-4">
          <USkeleton class="h-8 w-48" />
          <USkeleton class="h-4 w-32" />
          <USkeleton class="h-40 w-full rounded-2xl" />
          <USkeleton class="h-40 w-full rounded-2xl" />
        </div>

        <template v-else-if="detail">
          <div class="drawer-header">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Detail Transaksi</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">#{{ detail.id.slice(0, 12) }}</p>
            </div>
            <UButton icon="lucide:x" color="gray" variant="ghost" size="sm" @click="closeDrawer" />
          </div>

          <div class="p-6 space-y-6">
            <!-- Payment Info -->
            <section>
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Informasi Pembayaran</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Tanggal & Jam</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDateTime(detail.paymentDate) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Penyewa</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ detail.tenant.fullName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Kamar</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ detail.room.roomNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Periode Tagihan</span>
                  <span class="text-sm font-mono font-medium text-gray-900 dark:text-white">{{ detail.invoice.period }}</span>
                </div>
                <UDivider />
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Nominal Tagihan</span>
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">Rp {{ detail.invoice.total.toLocaleString('id-ID') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Nominal Dibayar</span>
                  <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">Rp {{ Number(detail.amount).toLocaleString('id-ID') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Sisa Tagihan</span>
                  <span v-if="detail.paymentSummary.isFullyPaid" class="text-sm font-semibold text-green-600 dark:text-green-400">Lunas</span>
                  <span v-else class="text-sm font-semibold text-orange-600 dark:text-orange-400">Rp {{ detail.paymentSummary.remaining.toLocaleString('id-ID') }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Status Pembayaran</span>
                  <UBadge :color="detail.paymentSummary.isFullyPaid ? 'success' : 'warning'" variant="subtle" size="sm">
                    {{ detail.paymentSummary.isFullyPaid ? 'Lunas' : 'Sebagian' }}
                  </UBadge>
                </div>
                <UDivider />
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Metode</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ methodLabel(detail.method) }}</span>
                </div>
                <div v-if="detail.referenceNo" class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">No. Referensi</span>
                  <span class="text-sm font-mono font-medium text-gray-900 dark:text-white">{{ detail.referenceNo }}</span>
                </div>
              </div>
            </section>

            <!-- Proof -->
            <section v-if="detail.proofUrl">
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Bukti Pembayaran</h3>
              <div class="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <img :src="detail.proofUrl" alt="Bukti pembayaran" class="w-full h-48 object-cover cursor-pointer" @click="openProofImage(detail.proofUrl)" />
              </div>
              <div class="flex items-center gap-2 mt-3">
                <UButton color="gray" variant="soft" size="sm" icon="lucide:zoom-in" @click="openProofImage(detail.proofUrl)">
                  Zoom
                </UButton>
                <UButton color="gray" variant="soft" size="sm" icon="lucide:download" :to="detail.proofUrl" download>
                  Download
                </UButton>
                <UButton color="gray" variant="soft" size="sm" icon="lucide:external-link" :to="detail.proofUrl" target="_blank">
                  Buka Ukuran Penuh
                </UButton>
              </div>
            </section>

            <!-- Verification History -->
            <section>
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Riwayat Verifikasi</h3>
              <div v-if="detail.verifiedBy" class="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Diverifikasi oleh</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ detail.verifiedBy.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Waktu</span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatDateTime(detail.verifiedAt) }}</span>
                </div>
                <div v-if="detail.notes" class="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span class="text-sm text-gray-500 dark:text-gray-400 block mb-1">Catatan</span>
                  <p class="text-sm text-gray-700 dark:text-gray-300">{{ detail.notes }}</p>
                </div>
              </div>
              <div v-else class="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <p class="text-sm text-gray-500 dark:text-gray-400">Belum diverifikasi</p>
              </div>
            </section>

            <!-- Additional Notes -->
            <section v-if="detail.notes && !detail.verifiedBy">
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Catatan Tambahan</h3>
              <div class="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ detail.notes }}</p>
              </div>
            </section>
          </div>
        </template>

        <div v-else class="p-6 text-center text-sm text-gray-500">Gagal memuat detail transaksi</div>
      </div>
    </div>

    <!-- Verify Modal -->
    <UModal v-model="verifyModalOpen">
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Verifikasi Pembayaran</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {{ verifyTarget ? 'Rp ' + Number(verifyTarget.amount).toLocaleString('id-ID') + ' — ' + verifyTarget.tenant.fullName : '' }}
        </p>

        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
        <USelect v-model="verifyForm.status" :items="verifyStatusOptions" class="w-full mb-4" />

        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan (opsional)</label>
        <UTextarea v-model="verifyForm.notes" placeholder="Catatan verifikasi..." :maxlength="500" class="w-full mb-6" />

        <div class="flex items-center justify-end gap-3">
          <UButton color="gray" variant="ghost" @click="verifyModalOpen = false">Batal</UButton>
          <UButton :loading="verifying" color="primary" @click="handleVerify">Konfirmasi</UButton>
        </div>

        <UAlert v-if="verifyError" color="error" variant="soft" :title="verifyError" icon="lucide:alert-circle" class="mt-4" />
      </div>
    </UModal>

    <!-- Proof Image Preview Modal -->
    <UModal v-model="proofModalOpen">
      <div class="relative">
        <div class="absolute top-4 right-4 z-10">
          <UButton icon="lucide:x" color="gray" variant="solid" size="sm" @click="proofModalOpen = false" />
        </div>
        <img v-if="proofImageUrl" :src="proofImageUrl" alt="Bukti pembayaran" class="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
      </div>
    </UModal>
  </div>
</template>

<script setup>
const page = ref(1)
const pageSize = ref(20)
const sortBy = ref('paymentDate')
const sortOrder = ref('desc')

const filters = reactive({
  search: '',
  dateFrom: '',
  dateTo: '',
  period: '',
  method: null,
  status: null,
  roomId: null,
})

let searchTimeout = null
function onSearchChange() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
  }, 300)
}

const queryParams = computed(() => {
  const q = { page: page.value, pageSize: pageSize.value, sortBy: sortBy.value, sortOrder: sortOrder.value }
  if (filters.search) q.search = filters.search
  if (filters.dateFrom) q.dateFrom = filters.dateFrom
  if (filters.dateTo) q.dateTo = filters.dateTo
  if (filters.period) q.period = filters.period
  if (filters.method) q.method = filters.method
  if (filters.status) q.status = filters.status
  if (filters.roomId) q.roomId = filters.roomId
  return q
})

const { data: response, status: fetchStatus, refresh } = await useFetch('/api/payments', {
  query: queryParams,
  watch: [queryParams],
})

const loading = computed(() => fetchStatus.value === 'pending')
const payments = computed(() => response.value?.data || [])
const pagination = computed(() => response.value?.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 })
const stats = computed(() => response.value?.stats || { totalTransactions: 0, totalRevenue: 0, thisMonthRevenue: 0, todayRevenue: 0 })

const { total, totalPages } = computed(() => pagination.value)

const loadingStats = computed(() => loading.value && !response.value)

const statCards = computed(() => [
  {
    label: 'Total Transaksi',
    value: stats.value.totalTransactions,
    icon: 'lucide:arrow-left-right',
    bgColor: 'bg-blue-500',
  },
  {
    label: 'Total Pemasukan',
    value: `Rp ${stats.value.totalRevenue.toLocaleString('id-ID')}`,
    icon: 'lucide:wallet',
    bgColor: 'bg-emerald-500',
  },
  {
    label: 'Bulan Ini',
    value: `Rp ${stats.value.thisMonthRevenue.toLocaleString('id-ID')}`,
    icon: 'lucide:calendar',
    bgColor: 'bg-violet-500',
  },
  {
    label: 'Hari Ini',
    value: `Rp ${stats.value.todayRevenue.toLocaleString('id-ID')}`,
    icon: 'lucide:trending-up',
    bgColor: 'bg-amber-500',
  },
])

const methodOptions = [
  { label: 'Semua Metode', value: null },
  { label: 'Tunai', value: 'CASH' },
  { label: 'Transfer Bank', value: 'TRANSFER' },
  { label: 'QRIS', value: 'QRIS' },
  { label: 'E-Wallet', value: 'E_WALLET' },
  { label: 'Lainnya', value: 'LAINNYA' },
]

const statusFilterOptions = [
  { label: 'Semua Status', value: null },
  { label: 'Terverifikasi', value: 'VERIFIED' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Ditolak', value: 'REJECTED' },
]

const rooms = ref([])
const roomOptions = computed(() => {
  const opts = [{ label: 'Semua Kamar', value: null }]
  rooms.value.forEach(r => opts.push({ label: r.roomNumber, value: r.id }))
  return opts
})

onMounted(async () => {
  try {
    const data = await $fetch('/api/rooms')
    rooms.value = Array.isArray(data) ? data : []
  } catch {}
})

function toggleSort(field) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
  page.value = 1
}

const visiblePages = computed(() => {
  const tp = totalPages.value
  const cp = page.value
  if (tp <= 7) {
    return Array.from({ length: tp }, (_, i) => i + 1)
  }
  const pages = []
  pages.push(1)
  if (cp > 3) pages.push('...')
  const start = Math.max(2, cp - 1)
  const end = Math.min(tp - 1, cp + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cp < tp - 2) pages.push('...')
  pages.push(tp)
  return pages
})

// Detail Drawer
const drawerOpen = ref(false)
const detailLoading = ref(false)
const detail = ref(null)

watch(drawerOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

async function openDetail(id) {
  drawerOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const data = await $fetch(`/api/payments/${id}`)
    detail.value = data
  } catch {
    detail.value = null
  } finally {
    detailLoading.value = false
  }
}

function closeDrawer() {
  drawerOpen.value = false
  detail.value = null
}

// Verify
const verifyModalOpen = ref(false)
const verifyTarget = ref(null)
const verifyForm = reactive({ status: 'VERIFIED', notes: '' })
const verifying = ref(false)
const verifyError = ref('')

const verifyStatusOptions = [
  { label: 'Terverifikasi', value: 'VERIFIED' },
  { label: 'Ditolak', value: 'REJECTED' },
]

function openVerify(p) {
  verifyTarget.value = p
  verifyForm.status = 'VERIFIED'
  verifyForm.notes = ''
  verifyError.value = ''
  verifyModalOpen.value = true
}

async function handleVerify() {
  if (!verifyTarget.value) return
  verifying.value = true
  verifyError.value = ''
  try {
    await $fetch(`/api/payments/${verifyTarget.value.id}/verify`, {
      method: 'PATCH',
      body: { status: verifyForm.status, notes: verifyForm.notes },
    })
    verifyModalOpen.value = false
    verifyTarget.value = null
    refresh()
  } catch (e) {
    verifyError.value = e.data?.statusMessage || 'Gagal verifikasi'
  } finally {
    verifying.value = false
  }
}

// Proof Image Preview
const proofModalOpen = ref(false)
const proofImageUrl = ref('')

function openProofImage(url) {
  proofImageUrl.value = url
  proofModalOpen.value = true
}

// Export
const exporting = ref(false)

async function handleExport() {
  exporting.value = true
  try {
    const params = new URLSearchParams()
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    if (filters.period) params.set('period', filters.period)
    if (filters.method) params.set('method', filters.method)
    if (filters.status) params.set('status', filters.status)
    if (filters.roomId) params.set('roomId', filters.roomId)
    const qs = params.toString()
    const url = `/api/payments/export${qs ? '?' + qs : ''}`
    const blob = await $fetch(url, { responseType: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `riwayat-pembayaran-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    // silent
  } finally {
    exporting.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' WIB'
}

function methodLabel(m) {
  const labels = { CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS', E_WALLET: 'E-Wallet', LAINNYA: 'Lainnya' }
  return labels[m] || m || '—'
}

function statusLabel(s) {
  return { PENDING: 'Menunggu', VERIFIED: 'Terverifikasi', REJECTED: 'Ditolak' }[s] || s
}

function statusColor(s) {
  return { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'error' }[s] || 'neutral'
}
</script>

<style>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
}

.drawer-overlay::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.drawer-panel {
  position: relative;
  width: 100%;
  max-width: 32rem;
  height: 100%;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow-y: auto;
  animation: drawerSlideIn 0.2s ease-out;
}

.dark .drawer-panel {
  background: #0f172a;
}

.drawer-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dark .drawer-header {
  background: #0f172a;
  border-bottom-color: #1e293b;
}

@keyframes drawerSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
