<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Penyewa</h1>
      <NuxtLink to="/tenants/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        + Tambah Penyewa
      </NuxtLink>
    </div>

    <div class="mb-4">
      <input v-model="search" type="text" placeholder="Cari nama atau no. HP..."
        class="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <div v-if="loading" class="text-gray-500">Memuat data...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="tenants.length === 0" class="text-gray-500">Belum ada penyewa.</div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Nama</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">No. HP</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">KTP</th>
            <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Kamar Aktif</th>
            <th class="text-right px-6 py-3 text-sm font-medium text-gray-500">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="t in tenants" :key="t.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ t.fullName }}</td>
            <td class="px-6 py-4">{{ t.phone }}</td>
            <td class="px-6 py-4 font-mono text-sm text-gray-500">{{ t.ktpMasked }}</td>
            <td class="px-6 py-4">
              <span v-if="t.activeRoom"
                class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Kamar {{ t.activeRoom.roomNumber }}
              </span>
              <span v-else class="text-gray-400 text-sm">—</span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <NuxtLink :to="`/tenants/${t.id}`"
                class="text-blue-600 hover:text-blue-800 text-sm">Edit</NuxtLink>
              <button @click="handleDelete(t)"
                class="text-red-600 hover:text-red-800 text-sm">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>

const search = ref('')

// Debounce search agar tidak fetch tiap keystroke
const debouncedSearch = ref('')
let debounceTimer = null
watch(search, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { debouncedSearch.value = val }, 300)
})

const queryParams = computed(() => {
  const q = {}
  if (debouncedSearch.value) q.search = debouncedSearch.value
  return q
})

const { data: tenants, refresh, status: fetchStatus } = await useFetch('/api/tenants', {
  query: queryParams,
})

const loading = computed(() => fetchStatus.value === 'pending')
const error = computed(() => fetchStatus.value === 'error' ? 'Gagal memuat data' : null)

async function handleDelete(tenant) {
  if (!confirm(`Hapus penyewa "${tenant.fullName}"?`)) return
  try {
    await $fetch(`/api/tenants/${tenant.id}`, { method: 'DELETE' })
    refresh()
  } catch (e) {
    alert(e.data?.statusMessage || 'Gagal menghapus penyewa')
  }
}
</script>
