<template>
  <NuxtPage v-if="$route.params.id" />

  <div v-else class="container-public">
    <!-- Header -->
    <section
      v-motion="{
        initial: { y: 30, opacity: 0 },
        enter: { y: 0, opacity: 1, transition: { duration: 600, ease: 'easeOut' } },
      }"
      class="pt-12 md:pt-16 pb-8"
    >
      <span class="tag bg-earth-gray-100 text-earth-gray-600 mb-4">Kamar</span>
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="font-heading text-3xl md:text-4xl font-bold text-earth-black mb-2">Kamar Tersedia</h1>
          <p class="text-earth-gray-500">{{ filteredRooms.length }} kamar tersedia untuk disewa</p>
        </div>
      </div>
    </section>

    <!-- Filter pills -->
    <div
      v-motion="{
        initial: { y: 20, opacity: 0 },
        enter: { y: 0, opacity: 1, transition: { delay: 150, duration: 500 } },
      }"
      class="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-earth-gray-200"
    >
      <button
        v-for="opt in priceFilters"
        :key="opt.value"
        @click="priceFilter = opt.value"
        class="pill-nav"
        :class="priceFilter === opt.value
          ? 'pill-nav--active'
          : 'pill-nav--inactive border border-earth-gray-200'"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Room Grid -->
    <section class="pb-20">
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="rounded-2xl bg-earth-gray-50 animate-pulse">
          <div class="aspect-[4/3] rounded-t-2xl bg-earth-gray-100" />
          <div class="p-5 space-y-3">
            <div class="h-5 bg-earth-gray-100 rounded w-1/2" />
            <div class="h-4 bg-earth-gray-100 rounded w-3/4" />
            <div class="h-10 bg-earth-gray-100 rounded-xl mt-4" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-20">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-earth-gray-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-earth-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-earth-gray-500 font-medium mb-3">Gagal memuat data kamar</p>
        <button @click="refresh" class="btn-yellow">Coba lagi</button>
      </div>

      <div v-else-if="filteredRooms.length === 0" class="text-center py-20">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-earth-gray-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-earth-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <p class="text-earth-gray-500 font-medium">Tidak ada kamar dengan filter ini</p>
        <button @click="priceFilter = 'semua'" class="btn-yellow mt-3">Reset filter</button>
      </div>

      <TransitionGroup
        v-else
        name="room-card"
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="(room, idx) in filteredRooms"
          :key="room.id"            v-motion="{
              initial: { y: 40, opacity: 0 },
              visibleOnce: { y: 0, opacity: 1, transition: { delay: idx * 80, duration: 500, ease: 'easeOut' } },
            }"
        >
          <PublicRoomCard :room="room" />
        </div>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'public' })

const priceFilter = ref('semua')

const priceFilters = [
  { label: 'Semua Harga', value: 'semua' },
  { label: '< Rp 1 Juta', value: 'under1' },
  { label: 'Rp 1–2 Juta', value: '1to2' },
  { label: '> Rp 2 Juta', value: 'over2' },
]

const { data: rooms, status, refresh } = useFetch('/api/rooms/available', {
  transform: (data) => data || [],
})

const loading = computed(() => status.value === 'pending')
const error = computed(() => status.value === 'error')

const filteredRooms = computed(() => {
  if (!rooms.value?.length) return []
  let list = rooms.value
  if (priceFilter.value === 'under1') {
    list = list.filter(r => Number(r.monthlyRate || r.price || 0) < 1000000)
  } else if (priceFilter.value === '1to2') {
    list = list.filter(r => {
      const p = Number(r.monthlyRate || r.price || 0)
      return p >= 1000000 && p <= 2000000
    })
  } else if (priceFilter.value === 'over2') {
    list = list.filter(r => Number(r.monthlyRate || r.price || 0) > 2000000)
  }
  return list
})
</script>

<style scoped>
.room-card-enter-active { transition: all 0.3s ease-out; }
.room-card-leave-active { position: absolute; transition: all 0.3s ease-out; }
.room-card-enter-from { opacity: 0; transform: translateY(12px) scale(0.97); }
.room-card-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }
.room-card-move { transition: transform 0.35s ease-out; }
</style>
