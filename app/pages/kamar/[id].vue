<template>
  <div class="container-public" style="max-width: 56rem;">
    <!-- Back -->
    <div class="pt-8 pb-6">
      <NuxtLink to="/kamar" class="inline-flex items-center gap-1.5 text-sm text-earth-gray-500 hover:text-earth-black transition-colors font-medium">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke daftar kamar
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6 pb-20">
      <div class="aspect-[16/9] rounded-3xl bg-earth-gray-100 animate-pulse" />
      <div class="h-8 bg-earth-gray-100 rounded w-1/2 animate-pulse" />
      <div class="h-4 bg-earth-gray-100 rounded w-3/4 animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-earth-gray-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-earth-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p class="text-earth-gray-500 font-medium">{{ error }}</p>
      <NuxtLink to="/kamar" class="btn-yellow mt-4">Kembali ke kamar</NuxtLink>
    </div>

    <template v-else>
      <!-- Image -->
      <div class="aspect-[16/9] rounded-3xl bg-earth-gray-100 overflow-hidden mb-8">
        <div class="w-full h-full flex items-center justify-center text-earth-gray-300">
          <svg class="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <!-- Info -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        <div class="lg:col-span-2">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="font-heading text-2xl md:text-3xl font-bold text-earth-black">{{ room?.roomNumber || 'Kamar' }}</h1>
              <p v-if="room?.size" class="text-sm text-earth-gray-400 mt-1">{{ room.size }} m²</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-earth-black font-heading">Rp {{ monthlyRate.toLocaleString('id-ID') }}</p>
              <p class="text-xs text-earth-gray-400">/bulan</p>
            </div>
          </div>

          <!-- Description -->
          <p v-if="room?.description" class="text-earth-gray-500 text-sm leading-relaxed mb-6">
            {{ room.description }}
          </p>
          <p v-else class="text-earth-gray-400 text-sm mb-6">
            Kamar nyaman dengan fasilitas lengkap, cocok untuk mahasiswa atau pekerja.
          </p>

          <!-- Facilities -->
          <div v-if="facilities.length" class="mb-8">
            <h3 class="font-semibold text-earth-black mb-3 text-sm uppercase tracking-wider">Fasilitas Kamar</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="fac in facilities"
                :key="fac"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm bg-earth-gray-100 text-earth-gray-700 border border-earth-gray-200"
              >
                <svg class="w-3.5 h-3.5 text-earth-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ fac }}
              </span>
            </div>
          </div>
        </div>

        <!-- Sidebar CTA -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 bg-earth-black rounded-2xl p-6">
            <h3 class="font-heading font-bold text-white mb-2">Tertarik dengan kamar ini?</h3>
            <p class="text-sm text-earth-gray-400 mb-5">Hubungi kami langsung untuk info lebih lanjut atau survey lokasi.</p>

            <a
              :href="waUrl"
              target="_blank"
              class="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-earth-yellow text-earth-black font-semibold text-sm hover:bg-earth-yellow-dark transition-all duration-200 active:scale-[0.97]"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hubungi via WhatsApp
            </a>

            <div class="mt-4 pt-4 border-t border-earth-gray-700">
              <div class="flex items-center gap-2 text-xs text-earth-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Aman & terpercaya
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'public' })

const route = useRoute()
const id = route.params.id

const { data: room, status } = useFetch(`/api/rooms/${id}`, {
  transform: (data) => data || null,
})

const loading = computed(() => status.value === 'pending')
const error = computed(() => {
  if (status.value === 'error') return 'Kamar tidak ditemukan'
  return null
})

const monthlyRate = computed(() => Number(room.value?.monthlyRate || room.value?.price || 0))

const facilities = computed(() => {
  if (room.value?.facilities?.length) return room.value.facilities
  return ['AC', 'WiFi', 'Kamar Mandi Dalam', 'Lemari', 'Meja & Kursi', 'Spring Bed']
})

const waUrl = computed(() => {
  const phone = '6281234567890'
  const msg = `Halo, saya tertarik dengan kamar ${room.value?.roomNumber || ''} di KosFlow. Bisa info lebih lanjut?`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
})
</script>
