<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Kamar</h1>
      <NuxtLink to="/rooms/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        + Tambah Kamar
      </NuxtLink>
    </div>

    <div class="flex gap-2 mb-4">
      <button v-for="s in statusFilters" :key="s.value" @click="filter = s.value"
        :class="[
          'px-3 py-1 rounded-md text-sm',
          filter === s.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]">
        {{ s.label }}
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Memuat data...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="rooms.length === 0" class="text-gray-500">Belum ada kamar.</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">No. Kamar</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Tarif Bulanan</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
            <th class="text-right px-6 py-3 text-sm font-medium text-gray-500">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="room in rooms" :key="room.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ room.roomNumber }}</td>
            <td class="px-6 py-4">Rp {{ Number(room.monthlyRate).toLocaleString('id-ID') }}</td>
            <td class="px-6 py-4">
              <span :class="statusBadge(room.status)">{{ statusLabel(room.status) }}</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <NuxtLink :to="`/rooms/${room.id}`"
                class="text-blue-600 hover:text-blue-800 text-sm">Edit</NuxtLink>
              <button @click="handleDelete(room)"
                class="text-red-600 hover:text-red-800 text-sm">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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

function statusBadge(s) {
  const base = 'px-2 py-0.5 rounded-full text-xs font-medium'
  const colors = {
    AVAILABLE: 'bg-green-100 text-green-800',
    OCCUPIED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  }
  return `${base} ${colors[s] || ''}`
}

async function handleDelete(room) {
  if (!confirm(`Hapus kamar "${room.roomNumber}"?`)) return
  try {
    await $fetch(`/api/rooms/${room.id}`, { method: 'DELETE' })
    refresh()
  } catch (e) {
    alert(e.data?.statusMessage || 'Gagal menghapus kamar')
  }
}
</script>
