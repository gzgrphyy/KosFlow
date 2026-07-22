<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Penyewa</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ tenants?.length || 0 }} penyewa terdaftar</p>
      </div>
      <UButton icon="heroicons:user-plus-20-solid" to="/tenants/create" color="primary" size="lg">
        Tambah Penyewa
      </UButton>
    </div>

    <UCard>
      <div class="mb-6">
        <UInput v-model="search" placeholder="Cari nama atau no. HP..." leading-icon="heroicons:magnifying-glass-20-solid" class="max-w-sm" />
      </div>

      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-12 w-full" />
      </div>
      <div v-else-if="error" class="text-red-500 text-sm text-center py-8">{{ error }}</div>
      <div v-else-if="tenants.length === 0" class="text-center py-12">
        <Icon name="heroicons:users-20-solid" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada penyewa</p>
        <UButton to="/tenants/create" color="primary" variant="soft" size="sm" class="mt-3">Tambah penyewa pertama</UButton>
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. HP</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">KTP</th>
            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kamar Aktif</th>
            <th class="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="t in tenants" :key="t.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ t.fullName }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ t.phone }}</td>
            <td class="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-500">{{ t.ktpMasked }}</td>
            <td class="px-6 py-4">
              <UBadge v-if="t.activeRoom" color="info" variant="subtle" size="sm">
                Kamar {{ t.activeRoom.roomNumber }}
              </UBadge>
              <span v-else class="text-sm text-gray-400">—</span>
            </td>
            <td class="px-6 py-4 text-right">
              <UButton :to="`/tenants/${t.id}`" icon="heroicons:pencil-square-20-solid" color="gray" variant="ghost" size="sm" class="text-gray-600 dark:text-gray-300" />
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const search = ref('')
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
