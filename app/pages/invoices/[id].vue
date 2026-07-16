<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/invoices" class="text-gray-400 hover:text-gray-600">← Kembali</NuxtLink>
      <h1 class="text-3xl font-bold">Detail Tagihan</h1>
    </div>

    <div v-if="loading" class="text-gray-500">Memuat data...</div>
    <div v-else-if="loadError" class="text-red-600">{{ loadError }}</div>

    <template v-else>
      <!-- Info Tagihan -->
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-lg font-semibold">{{ invoice?.tenant?.fullName }}</h2>
            <p class="text-gray-500 text-sm">Kamar {{ invoice?.room?.roomNumber }}</p>
          </div>
          <span :class="statusBadge(invoice?.status)">{{ statusLabel(invoice?.status) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
          <div>
            <p class="font-medium text-gray-700">Periode</p>
            <p class="font-mono text-base">{{ invoice?.period }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Jatuh Tempo</p>
            <p>{{ formatDate(invoice?.dueDate) }}</p>
          </div>
        </div>

        <!-- Item Tagihan -->
        <table class="w-full text-sm mb-4">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-2 text-gray-500 font-medium">Keterangan</th>
              <th class="text-right py-2 text-gray-500 font-medium">Jumlah</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in invoice?.items" :key="item.id">
              <td class="py-2">{{ item.description }}</td>
              <td class="py-2 text-right">Rp {{ item.amount.toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-300">
              <td class="py-2 font-bold">Total</td>
              <td class="py-2 text-right font-bold text-lg">
                Rp {{ invoice?.total?.toLocaleString('id-ID') }}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Update Status Manual -->
        <div class="border-t pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
          <div class="flex gap-2 items-center">
            <select v-model="newStatus"
              class="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="BELUM_LUNAS">Belum Lunas</option>
              <option value="LUNAS">Lunas</option>
              <option value="TELAT">Telat</option>
            </select>
            <button @click="handleUpdateStatus" :disabled="updatingStatus || newStatus === invoice?.status"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm">
              {{ updatingStatus ? 'Menyimpan...' : 'Simpan Status' }}
            </button>
          </div>
          <p v-if="statusError" class="text-red-600 text-sm mt-1">{{ statusError }}</p>
          <p v-if="statusSuccess" class="text-green-600 text-sm mt-1">{{ statusSuccess }}</p>
        </div>
      </div>

      <!-- Riwayat Pembayaran -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Riwayat Pembayaran</h2>
        <div v-if="!invoice?.payments?.length" class="text-gray-400 text-sm">
          Belum ada pembayaran untuk tagihan ini.
        </div>
        <div v-else class="space-y-3">
          <div v-for="p in invoice.payments" :key="p.id"
            class="border border-gray-200 rounded-md p-4">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">Rp {{ Number(p.amount).toLocaleString('id-ID') }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(p.paymentDate) }}</p>
                <p v-if="p.notes" class="text-sm text-gray-500 mt-1">{{ p.notes }}</p>
              </div>
              <span :class="paymentBadge(p.status)">{{ paymentLabel(p.status) }}</span>
            </div>
            <div v-if="p.verifiedBy" class="text-xs text-gray-400 mt-2">
              Diverifikasi oleh {{ p.verifiedBy.name }} pada {{ formatDate(p.verifiedAt) }}
            </div>
          </div>
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

function statusBadge(s) {
  const base = 'px-3 py-1 rounded-full text-sm font-medium'
  const colors = {
    BELUM_LUNAS: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
    TELAT: 'bg-red-100 text-red-800',
  }
  return `${base} ${colors[s] || 'bg-gray-100 text-gray-600'}`
}

function paymentLabel(s) {
  return { PENDING: 'Menunggu', VERIFIED: 'Terverifikasi', REJECTED: 'Ditolak' }[s] || s
}

function paymentBadge(s) {
  const base = 'px-2 py-0.5 rounded-full text-xs font-medium'
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    VERIFIED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  return `${base} ${colors[s] || 'bg-gray-100 text-gray-600'}`
}
</script>
