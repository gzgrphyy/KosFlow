<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <div v-if="pending" class="text-gray-500">Memuat data...</div>
    <div v-else-if="error" class="text-red-600">Gagal memuat dashboard</div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-sm font-medium text-gray-500">Total Kamar</h2>
          <p class="text-3xl font-bold mt-1">{{ stats.totalRooms }}</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ stats.availableRooms }} tersedia &middot; {{ stats.maintenanceRooms }} perbaikan
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-sm font-medium text-gray-500">Kamar Terisi</h2>
          <p class="text-3xl font-bold mt-1">{{ stats.occupiedRooms }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ stats.activeTenants }} penghuni aktif</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-sm font-medium text-gray-500">Tagihan Bulan Ini</h2>
          <p class="text-3xl font-bold mt-1">{{ stats.monthlyInvoices }}</p>
          <p class="text-xs text-gray-400 mt-1">Rp {{ stats.monthlyTotal.toLocaleString('id-ID') }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-sm font-medium text-gray-500">Pembayaran Pending</h2>
          <p class="text-3xl font-bold mt-1">{{ stats.pendingPayments }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Ringkasan Kamar</h2>
        <div class="w-full bg-gray-200 rounded-full h-4">
          <div class="bg-blue-600 h-4 rounded-full transition-all"
            :style="{ width: occupancyPct + '%' }"></div>
        </div>
        <p class="text-sm text-gray-500 mt-2">
          {{ stats.occupiedRooms }} dari {{ stats.totalRooms }} kamar terisi ({{ occupancyPct }}%)
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>

const { data: stats, pending, error } = await useFetch('/api/dashboard/stats')

const occupancyPct = computed(() => {
  if (!stats.value?.totalRooms) return 0
  return Math.round((stats.value.occupiedRooms / stats.value.totalRooms) * 100)
})
</script>
