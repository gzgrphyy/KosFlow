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

        <div class="border-t border-gray-100 dark:border-gray-800 pt-5 mt-5">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
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
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ formatDate(p.paymentDate) }}</p>
                <p v-if="p.notes" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ p.notes }}</p>
              </div>
              <UBadge :color="paymentColor(p.status)" variant="subtle" size="sm">
                {{ paymentLabel(p.status) }}
              </UBadge>
            </div>
            <div v-if="p.verifiedBy" class="text-xs text-gray-400 dark:text-gray-500 mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
              Diverifikasi oleh {{ p.verifiedBy.name }} pada {{ formatDate(p.verifiedAt) }}
            </div>
          </div>
        </div>
      </UCard>
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

function statusLabel(s) {
  return { BELUM_LUNAS: 'Belum Lunas', LUNAS: 'Lunas', TELAT: 'Telat' }[s] || s
}

function statusColor(s) {
  return { BELUM_LUNAS: 'warning', LUNAS: 'success', TELAT: 'error' }[s] || 'neutral'
}

function paymentLabel(s) {
  return { PENDING: 'Menunggu', VERIFIED: 'Terverifikasi', REJECTED: 'Ditolak' }[s] || s
}

function paymentColor(s) {
  return { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'error' }[s] || 'neutral'
}
</script>
