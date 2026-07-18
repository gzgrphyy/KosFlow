<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kamar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ rooms?.length || 0 }} kamar terdaftar
        </p>
      </div>
      <UButton icon="heroicons:plus-20-solid" to="/rooms/create" color="primary" size="lg">
        Tambah Kamar
      </UButton>
    </div>

    <UCard>
      <div class="flex items-center gap-2 mb-6">
        <UButtonGroup size="sm">
          <UButton
            v-for="s in statusFilters"
            :key="s.value"
            :color="filter === s.value ? 'primary' : 'neutral'"
            :variant="filter === s.value ? 'solid' : 'ghost'"
            @click="filter = s.value"
          >
            {{ s.label }}
          </UButton>
        </UButtonGroup>
      </div>

      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-12 w-full" />
      </div>

      <div v-else-if="error" class="text-red-500 text-sm text-center py-8">{{ error }}</div>

      <div v-else-if="rooms.length === 0" class="text-center py-12">
        <Icon name="heroicons:home-modern-20-solid" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada kamar</p>
        <UButton to="/rooms/create" color="primary" variant="soft" size="sm" class="mt-3">
          Tambah kamar pertama
        </UButton>
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. Kamar</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarif Bulanan</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th class="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="room in rooms" :key="room.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ room.roomNumber }}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">Rp {{ Number(room.monthlyRate).toLocaleString('id-ID') }}</td>
            <td class="px-6 py-4">
              <UBadge :color="statusColor(room.status)" variant="subtle" size="sm">
                {{ statusLabel(room.status) }}
              </UBadge>
            </td>
            <td class="px-6 py-4 text-right">
              <UButton :to="`/rooms/${room.id}`" icon="heroicons:pencil-square-20-solid" color="gray" variant="ghost" size="sm" />
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </div>
</template>

<script setup>
const filter = ref('')

const queryParams = computed(() => {
  const q = {}
  if (filter.value) q.status = filter.value
  return q
})

const { data: rooms, refresh, status: fetchStatus } = await useFetch('/api/rooms', {
  query: queryParams,
})

const loading = computed(() => fetchStatus.value === 'pending')
const error = computed(() => fetchStatus.value === 'error' ? 'Gagal memuat data' : null)

const statusFilters = [
  { label: 'Semua', value: '' },
  { label: 'Tersedia', value: 'AVAILABLE' },
  { label: 'Terisi', value: 'OCCUPIED' },
  { label: 'Perbaikan', value: 'MAINTENANCE' },
]

function statusLabel(s) {
  return { AVAILABLE: 'Tersedia', OCCUPIED: 'Terisi', MAINTENANCE: 'Perbaikan' }[s] || s
}

function statusColor(s) {
  return { AVAILABLE: 'success', OCCUPIED: 'info', MAINTENANCE: 'warning' }[s] || 'neutral'
}
</script>
