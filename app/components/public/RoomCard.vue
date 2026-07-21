<template>
  <div class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <!-- Image (rasio 4:3) -->
    <div class="aspect-[4/3] bg-gray-50 relative overflow-hidden">
      <!-- Foto asli -->
      <img
        v-if="room.image"
        :src="room.image"
        :alt="room.roomNumber"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      <!-- Fallback: foto belum diupload -->
      <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300 select-none">
        <svg class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs font-medium text-gray-400">Foto menyusul</span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-5">
      <!-- Nama kamar & Harga -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <h3 class="font-semibold text-gray-900 text-base">{{ room.roomNumber }}</h3>
        <div class="text-right shrink-0">
          <p class="text-base font-bold text-teal-700 leading-tight">Rp {{ monthlyRate.toLocaleString('id-ID') }}</p>
          <p class="text-[11px] text-gray-400">/bulan</p>
        </div>
      </div>

      <!-- Badge fasilitas (2–4 paling menjual) -->
      <div v-if="topFacilities.length" class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="fac in topFacilities"
          :key="fac"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700"
        >
          {{ fac }}
        </span>
        <span v-if="room.facilities?.length > 4" class="text-[11px] text-gray-400 px-1 flex items-center">
          +{{ room.facilities.length - 4 }}
        </span>
      </div>

      <!-- CTA: full width, warna aksen -->
      <NuxtLink
        :to="`/kamar/${room.id}`"
        class="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm hover:shadow-md hover:from-teal-600 hover:to-emerald-700 active:scale-[0.98]"
      >
        Lihat Detail
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  room: { type: Object, required: true },
})

const monthlyRate = computed(() => Number(props.room.monthlyRate || 0))

/**
 * Urutkan fasilitas dengan prioritas (AC, WiFi, Kamar Mandi Dalam paling atas),
 * lalu ambil maksimal 4 yang paling menjual.
 */
const priorityOrder = ['AC', 'WiFi', 'Kamar Mandi Dalam', 'WiFi Cepat', 'AC Dingin']

const topFacilities = computed(() => {
  if (!props.room.facilities?.length) return []

  const sorted = [...props.room.facilities].sort((a, b) => {
    const ia = priorityOrder.indexOf(a)
    const ib = priorityOrder.indexOf(b)
    // Yang ada di priorityOrder naik ke atas
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return 0
  })

  return sorted.slice(0, 4)
})
</script>
