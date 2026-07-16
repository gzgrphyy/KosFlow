<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Tagihan</h1>
      <div class="flex gap-2">
        <button @click="handleMarkOverdue" :disabled="markingOverdue"
          class="px-4 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 text-sm disabled:opacity-50">
          {{ markingOverdue ? 'Memproses...' : '⏰ Tandai Telat' }}
        </button>
        <NuxtLink to="/invoices/create"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + Generate Tagihan
        </NuxtLink>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input v-model="filterPeriod" type="month"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      <div class="flex gap-2">
        <button v-for="s in statusFilters" :key="s.value" @click="filterStatus = s.value"
          :class="['px-3 py-1 rounded-md text-sm', filterStatus === s.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300']">
          {{ s.label }}
        </button>
      </div>
    </div>

    <p v-if="overdueMsg" class="mb-4 px-4 py-2 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-800">
      {{ overdueMsg }}
    </p>

    <div v-if="loading" class="text-gray-500">Memuat data...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="invoices.length === 0" class="text-gray-500">Tidak ada tagihan ditemukan.</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Penyewa</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Kamar</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Periode</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Jatuh Tempo</th>
            <th class="text-right px-6 py-3 text-sm font-medium text-gray-500">Total</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
            <th class="text-right px-6 py-3 text-sm font-medium text-gray-500">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ inv.tenant.fullName }}</td>
            <td class="px-6 py-4">{{ inv.room.roomNumber }}</td>
            <td class="px-6 py-4 font-mono text-sm">{{ inv.period }}</td>
            <td class="px-6 py-4 text-sm">{{ formatDate(inv.dueDate) }}</td>
            <td class="px-6 py-4 text-right font-medium">
              Rp {{ inv.total.toLocaleString('id-ID') }}
            </td>
            <td class="px-6 py-4">
              <span :class="statusBadge(inv.status)">{{ statusLabel(inv.status) }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <NuxtLink :to="`/invoices/${inv.id}`"
                class="text-blue-600 hover:text-blue-800 text-sm">Detail</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>

const filterPeriod = ref('')
const filterStatus = ref('')

const queryParams = computed(() => {
  const q = {}
  if (filterPeriod.value) q.period = filterPeriod.value
  if (filterStatus.value) q.status = filterStatus.value
  return q
})

const { data: invoices, status: fetchStatus, refresh } = await useFetch('/api/invoices', {
  query: queryParams,
})

const loading = computed(() => fetchStatus.value === 'pending')
const error = computed(() => fetchStatus.value === 'error' ? 'Gagal memuat data' : null)

const statusFilters = [
  { label: 'Semua', value: '' },
  { label: 'Belum Lunas', value: 'BELUM_LUNAS' },
  { label: 'Lunas', value: 'LUNAS' },
  { label: 'Telat', value: 'TELAT' },
]

function statusLabel(s) {
  return { BELUM_LUNAS: 'Belum Lunas', LUNAS: 'Lunas', TELAT: 'Telat' }[s] || s
}

function statusBadge(s) {
  const base = 'px-2 py-0.5 rounded-full text-xs font-medium'
  const colors = {
    BELUM_LUNAS: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
    TELAT: 'bg-red-100 text-red-800',
  }
  return `${base} ${colors[s] || 'bg-gray-100 text-gray-600'}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const markingOverdue = ref(false)
const overdueMsg = ref('')

async function handleMarkOverdue() {
  if (!confirm('Tandai semua tagihan yang sudah lewat jatuh tempo sebagai TELAT?')) return
  markingOverdue.value = true
  overdueMsg.value = ''
  try {
    const res = await $fetch('/api/invoices/overdue', { method: 'POST' })
    overdueMsg.value = res.message
    refresh()
  } catch (e) {
    overdueMsg.value = e.data?.statusMessage || 'Gagal memproses'
  } finally {
    markingOverdue.value = false
  }
}
</script>
