<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tagihan</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ invoices?.length || 0 }} tagihan</p>
      </div>
      <div class="flex gap-3">
        <UButton color="warning" variant="soft" :loading="markingOverdue" @click="handleMarkOverdue">
          Tandai Telat
        </UButton>
        <UButton icon="heroicons:plus-20-solid" to="/invoices/create" color="primary" size="lg">
          Generate Tagihan
        </UButton>
      </div>
    </div>

    <UCard>
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <UInput v-model="filterPeriod" type="month" class="w-40" />
        <UButtonGroup size="sm">
          <UButton
            v-for="s in statusFilters"
            :key="s.value"
            :color="filterStatus === s.value ? 'primary' : 'neutral'"
            :variant="filterStatus === s.value ? 'solid' : 'ghost'"
            @click="filterStatus = s.value"
          >
            {{ s.label }}
          </UButton>
        </UButtonGroup>
      </div>

      <UAlert v-if="overdueMsg" color="warning" variant="soft" :title="overdueMsg" icon="heroicons:clock-20-solid" class="mb-4" />

      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-12 w-full" />
      </div>
      <div v-else-if="error" class="text-red-500 text-sm text-center py-8">{{ error }}</div>
      <div v-else-if="invoices.length === 0" class="text-center py-12">
        <Icon name="heroicons:currency-dollar-20-solid" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Tidak ada tagihan ditemukan</p>
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Penyewa</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kamar</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Periode</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jatuh Tempo</th>
            <th class="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th class="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ inv.tenant.fullName }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ inv.room.roomNumber }}</td>
            <td class="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">{{ inv.period }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(inv.dueDate) }}</td>
            <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
              Rp {{ inv.total.toLocaleString('id-ID') }}
            </td>
            <td class="px-6 py-4">
              <UBadge :color="statusColor(inv.status)" variant="subtle" size="sm">
                {{ statusLabel(inv.status) }}
              </UBadge>
            </td>
            <td class="px-6 py-4 text-right">
              <UButton :to="`/invoices/${inv.id}`" icon="heroicons:chevron-right-20-solid" color="gray" variant="ghost" size="sm" />
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
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
  return { BELUM_LUNAS: 'Belum Lunas', SEBAGIAN: 'Sebagian', LUNAS: 'Lunas', TELAT: 'Telat' }[s] || s
}

function statusColor(s) {
  return { BELUM_LUNAS: 'warning', SEBAGIAN: 'neutral', LUNAS: 'success', TELAT: 'error' }[s] || 'neutral'
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
