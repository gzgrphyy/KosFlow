<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ greeting }}, {{ user?.name || 'User' }}!
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ todayDate }}</p>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>

    <div v-else-if="error" class="text-red-600">Gagal memuat dashboard</div>

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="card in statCards" :key="card.label"
          class="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
          <div class="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10"
            :class="card.bgColor"></div>
          <div class="flex items-start justify-between relative">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ card.label }}</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ card.value }}</p>
              <p v-if="card.sub" class="text-xs text-gray-400 dark:text-gray-500">{{ card.sub }}</p>
            </div>
            <div class="p-3 rounded-lg" :class="card.bgColor">
              <Icon :name="card.icon" class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Ringkasan + Tagihan -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <UCard>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-900 dark:text-white">Ringkasan Kamar</h2>
            <UBadge :color="occupancyPct >= 80 ? 'orange' : occupancyPct >= 50 ? 'yellow' : 'green'" variant="subtle" :class="badgeDarkClass">
              {{ occupancyPct }}% terisi
            </UBadge>
          </div>
          <UProgress :value="occupancyPct" size="lg" :color="occupancyPct >= 80 ? 'orange' : 'blue'" />
          <div class="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ stats.availableRooms }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Tersedia</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ stats.occupiedRooms }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Terisi</p>
            </div>
            <div>
              <p class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ stats.maintenanceRooms }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Perbaikan</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-900 dark:text-white">Tagihan Bulan Ini</h2>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ currentMonth }}</span>
          </div>
          <div v-if="stats.monthlyInvoices > 0" class="flex items-end gap-3 mb-4">
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.monthlyInvoices }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">tagihan</p>
          </div>
          <div v-else class="text-sm text-gray-400 dark:text-gray-500 mb-4">Belum ada tagihan bulan ini</div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Total nominal</span>
              <span class="font-semibold text-gray-900 dark:text-white">Rp {{ stats.monthlyTotal.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Pembayaran pending</span>
              <span class="font-semibold text-orange-600 dark:text-orange-400">{{ stats.pendingPayments }}</span>
            </div>
          </div>
          <UDivider class="my-4" />
          <NuxtLink to="/invoices/create" class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <Icon name="heroicons:plus-20-solid" class="w-4 h-4" /> Buat tagihan baru
          </NuxtLink>
        </UCard>
      </div>

      <!-- Row 2.5: Status Tagihan Bulan Ini -->
      <UCard class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900 dark:text-white">Status Tagihan Bulan Ini</h2>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ currentMonth }}</span>
        </div>
        <DashboardInvoiceStatusBreakdownChart
          :data="breakdownData"
          :loading="breakdownPending"
          @bar-click="handleBarClick"
        />
      </UCard>

      <!-- Row 3: Quick Actions -->
      <UCard class="mb-6">
        <h2 class="font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink to="/rooms/create"
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Icon name="heroicons:home-modern-20-solid" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Tambah Kamar</p>
              <p class="text-xs text-gray-400 dark:text-gray-500">Ruangan baru</p>
            </div>
          </NuxtLink>
          <NuxtLink to="/tenants/create"
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Icon name="heroicons:user-plus-20-solid" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Tambah Penyewa</p>
              <p class="text-xs text-gray-400 dark:text-gray-500">Penghuni baru</p>
            </div>
          </NuxtLink>
          <NuxtLink to="/invoices/create"
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Icon name="heroicons:currency-dollar-20-solid" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Buat Tagihan</p>
              <p class="text-xs text-gray-400 dark:text-gray-500">Invoice baru</p>
            </div>
          </NuxtLink>
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const { loggedIn, user } = useUserSession()

const { data: stats, pending, error } = await useFetch('/api/dashboard/stats')

const { data: breakdownData, pending: breakdownPending } = await useFetch('/api/dashboard/invoice-status-breakdown')

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const now = new Date()
const currentMonth = computed(() => `${months[now.getMonth()]} ${now.getFullYear()}`)

const hour = now.getHours()
const greeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'

const todayDate = now.toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

const occupancyPct = computed(() => {
  if (!stats.value?.totalRooms) return 0
  return Math.round((stats.value.occupiedRooms / stats.value.totalRooms) * 100)
})

const badgeDarkClass = computed(() => {
  if (occupancyPct.value >= 80) return 'dark:text-orange-300 dark:bg-orange-900/20'
  if (occupancyPct.value >= 50) return 'dark:text-yellow-300 dark:bg-yellow-900/20'
  return 'dark:text-green-300 dark:bg-green-900/20'
})

const statCards = computed(() => [
  {
    label: 'Total Kamar',
    value: stats.value?.totalRooms ?? 0,
    sub: `${stats.value?.availableRooms ?? 0} tersedia · ${stats.value?.maintenanceRooms ?? 0} perbaikan`,
    icon: 'heroicons:home-modern-20-solid',
    bgColor: 'bg-blue-500',
  },
  {
    label: 'Kamar Terisi',
    value: stats.value?.occupiedRooms ?? 0,
    sub: `${stats.value?.activeTenants ?? 0} penghuni aktif`,
    icon: 'heroicons:users-20-solid',
    bgColor: 'bg-green-500',
  },
  {
    label: 'Tagihan Bulan Ini',
    value: stats.value?.monthlyInvoices ?? 0,
    sub: `Rp ${(stats.value?.monthlyTotal ?? 0).toLocaleString('id-ID')}`,
    icon: 'heroicons:currency-dollar-20-solid',
    bgColor: 'bg-purple-500',
  },
  {
    label: 'Pembayaran Pending',
    value: stats.value?.pendingPayments ?? 0,
    icon: 'heroicons:clock-20-solid',
    bgColor: 'bg-orange-500',
  },
])

function handleBarClick(status) {
  navigateTo(`/invoices?status=${status}`)
}
</script>
