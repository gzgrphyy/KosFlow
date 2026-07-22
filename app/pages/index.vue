<template>
  <div>
    <div class="container-public">
      <!-- ═══════ HERO — Earthon animated ═══════ -->
      <section
        v-motion="{
          initial: { y: 40, opacity: 0 },
          enter: { y: 0, opacity: 1, transition: { duration: 700, ease: 'easeOut' } },
        }"
        class="pt-12 md:pt-20 pb-16 md:pb-24"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Left -->
          <div class="order-2 lg:order-1">
            <div
              v-motion="{
                initial: { y: 30, opacity: 0 },
                enter: { y: 0, opacity: 1, transition: { delay: 150, duration: 600 } },
              }"
              class="inline-flex items-center gap-2 tag bg-earth-yellow/20 text-earth-black font-semibold mb-6"
            >
              <span class="w-2 h-2 rounded-full bg-earth-yellow-dark animate-pulse" />
              {{ availableCount }} kamar tersedia
            </div>
            <h1
              v-motion="{
                initial: { y: 30, opacity: 0 },
                enter: { y: 0, opacity: 1, transition: { delay: 250, duration: 600 } },
              }"
              class="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-earth-black leading-[1.05] tracking-tight mb-5"
            >
              Kos Nyaman
              <span class="inline-block" style="border-bottom: 4px solid #fff017; line-height: 1.1;">
                Untuk Aktivitasmu
              </span>
            </h1>
            <p
              v-motion="{
                initial: { y: 30, opacity: 0 },
                enter: { y: 0, opacity: 1, transition: { delay: 350, duration: 600 } },
              }"
              class="text-lg text-earth-gray-500 leading-relaxed max-w-lg mb-8"
            >
              Tempat tinggal ideal dengan fasilitas lengkap, lokasi strategis, dan harga bersahabat. Cocok untuk mahasiswa & pekerja.
            </p>
            <!-- CTAs -->
            <div
              v-motion="{
                initial: { y: 30, opacity: 0 },
                enter: { y: 0, opacity: 1, transition: { delay: 450, duration: 600 } },
              }"
              class="flex flex-wrap gap-3"
            >
              <NuxtLink
                to="/kamar"
                class="btn-yellow px-7 py-3 text-base"
              >
                Lihat Kamar Tersedia
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
              <a
                href="https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20KosFlow"
                target="_blank"
                class="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-earth-gray-300 text-earth-black/80 font-semibold text-sm hover:bg-earth-gray-100 hover:border-earth-gray-400 transition-all duration-200 active:scale-[0.97]"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Hubungi via WhatsApp
              </a>
            </div>
            <!-- Stats -->
            <div
              v-motion="{
                initial: { y: 30, opacity: 0 },
                enter: { y: 0, opacity: 1, transition: { delay: 550, duration: 600 } },
              }"
              class="flex items-center gap-6 mt-10 pt-8 border-t border-earth-gray-200"
            >
              <div class="hover:-translate-y-0.5 transition-transform duration-200">
                <p class="text-2xl font-bold text-earth-black font-heading">{{ totalRooms }}</p>
                <p class="text-xs text-earth-gray-400">Total Kamar</p>
              </div>
              <div class="w-px h-10 bg-earth-gray-200" />
              <div class="hover:-translate-y-0.5 transition-transform duration-200">
                <p class="text-2xl font-bold text-earth-black font-heading">{{ availableCount }}</p>
                <p class="text-xs text-earth-gray-400">Tersedia</p>
              </div>
              <div class="w-px h-10 bg-earth-gray-200" />
              <div class="hover:-translate-y-0.5 transition-transform duration-200">
                <p class="text-2xl font-bold text-earth-black font-heading">{{ startingPrice }}</p>
                <p class="text-xs text-earth-gray-400">Mulai/bulan</p>
              </div>
            </div>
          </div>

          <!-- Right: Visual -->
          <div class="order-1 lg:order-2 relative">
            <div
              v-motion="{
                initial: { scale: 0.95, opacity: 0 },
                enter: { scale: 1, opacity: 1, transition: { delay: 200, duration: 800, ease: 'easeOut' } },
              }"
              class="aspect-[4/3] rounded-3xl bg-earth-gray-100 overflow-hidden"
            >
              <div class="w-full h-full flex items-center justify-center text-earth-gray-300">
                <svg class="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <!-- Floating card -->
            <div
              v-motion="{
                initial: { y: 20, opacity: 0 },
                enter: { y: 0, opacity: 1, transition: { delay: 600, duration: 600, ease: 'easeOut' } },
              }"
              class="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-earth-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-earth-yellow/20 flex items-center justify-center text-earth-black">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-earth-black">Lingkungan Aman</p>
                  <p class="text-xs text-earth-gray-400">24 Jam CCTV & Satpam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════ FASILITAS ═══════ -->
      <section
        v-motion="{
          initial: { y: 60, opacity: 0 },
          visibleOnce: { y: 0, opacity: 1, transition: { duration: 700, ease: 'easeOut' } },
        }"
        class="section-padding"
      >
        <div class="text-center mb-12">
          <span class="tag bg-earth-gray-100 text-earth-gray-600 mb-4">Fasilitas</span>
          <h2 class="font-heading text-3xl md:text-4xl font-bold text-earth-black mb-3">Fasilitas Kos</h2>
          <p class="text-earth-gray-500 max-w-lg mx-auto">Semua kebutuhan tinggalmu ada di sini, dengan fasilitas terbaik untuk kenyamananmu.</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            v-for="(fac, idx) in facilities"
            :key="fac.label"
            v-motion="{
              initial: { y: 40, opacity: 0 },
              visibleOnce: { y: 0, opacity: 1, transition: { delay: idx * 80, duration: 500, ease: 'easeOut' } },
            }"
            class="flex flex-col items-center gap-3 p-6 card-public hover:-translate-y-0.5 hover:shadow-md"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110" :class="fac.bg">
              <component :is="fac.icon" class="w-6 h-6" :class="fac.color" />
            </div>
            <p class="text-sm font-semibold text-earth-black text-center">{{ fac.label }}</p>
          </div>
        </div>
      </section>

      <!-- ═══════ PREVIEW KAMAR ═══════ -->
      <section
        v-motion="{
          initial: { y: 60, opacity: 0 },
          visibleOnce: { y: 0, opacity: 1, transition: { duration: 700, ease: 'easeOut' } },
        }"
        class="section-padding"
      >
        <div class="flex items-end justify-between mb-10">
          <div>
            <span class="tag bg-earth-gray-100 text-earth-gray-600 mb-4">Kamar</span>
            <h2 class="font-heading text-3xl md:text-4xl font-bold text-earth-black mb-2">Kamar Tersedia</h2>
            <p class="text-earth-gray-500">Pilih kamar favoritmu sebelum kehabisan</p>
          </div>
          <NuxtLink to="/kamar" class="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-earth-black hover:text-earth-yellow-dark transition-colors duration-200">
            Lihat Semua
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(room, idx) in previewRooms"
            :key="room.id"
            v-motion="{
              initial: { y: 50, opacity: 0 },
              visibleOnce: { y: 0, opacity: 1, transition: { delay: idx * 120, duration: 600, ease: 'easeOut' } },
            }"
          >
            <PublicRoomCard :room="room" />
          </div>
        </div>
        <div class="mt-8 text-center sm:hidden">
          <NuxtLink to="/kamar" class="btn-yellow">
            Lihat Semua Kamar
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </section>
    </div>

    <!-- ═══════ CTA BANNER ═══════ -->
    <section
      v-motion="{
        initial: { y: 60, opacity: 0 },
        visibleOnce: { y: 0, opacity: 1, transition: { duration: 700, ease: 'easeOut' } },
      }"
      class="bg-earth-black py-20"
    >
      <div class="container-public text-center">
        <span class="tag bg-white/10 text-white mb-4">Hubungi Kami</span>
        <h2 class="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Siap Jadi Penghuni KosFlow?</h2>
        <p class="text-earth-gray-400 mb-8 max-w-md mx-auto">Hubungi kami sekarang untuk survey lokasi atau dapatkan info lebih lanjut.</p>
        <a
          href="https://wa.me/6281234567890?text=Halo%20saya%20ingin%20survey%20lokasi%20KosFlow"
          target="_blank"
          class="btn-yellow px-8 py-3.5 text-base inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Hubungi via WhatsApp
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { h } from 'vue'

definePageMeta({ layout: 'public' })

const facilities = [
  { label: 'WiFi Cepat', bg: 'bg-earth-yellow/10', color: 'text-earth-black', icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'stroke-width': '1.5', innerHTML: '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 18h.01M9.172 15.172a4 4 0 015.656 0M6.343 12.343a8 8 0 0111.314 0M3.515 9.515c4.686-4.687 12.284-4.687 17 0\" />' }) },
  { label: 'AC Dingin', bg: 'bg-earth-gray-100', color: 'text-earth-black', icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'stroke-width': '1.5', innerHTML: '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z\" />' }) },
  { label: 'Kamar Mandi Dalam', bg: 'bg-earth-gray-100', color: 'text-earth-black', icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'stroke-width': '1.5', innerHTML: '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2\" /><circle cx=\"12\" cy=\"7\" r=\"3\" />' }) },
  { label: 'Dapur Bersama', bg: 'bg-earth-yellow/10', color: 'text-earth-black', icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'stroke-width': '1.5', innerHTML: '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4\" />' }) },
  { label: 'Parkir Motor', bg: 'bg-earth-gray-100', color: 'text-earth-black', icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'stroke-width': '1.5', innerHTML: '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01\" />' }) },
  { label: 'Keamanan 24 Jam', bg: 'bg-earth-yellow/10', color: 'text-earth-black', icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'stroke-width': '1.5', innerHTML: '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\" />' }) },
]

const totalRooms = 12
const availableCount = 4
const startingPrice = 'Rp 800RB'

const { data: rooms } = useFetch('/api/rooms/available', {
  transform: (data) => data || [],
})

const previewRooms = computed(() => (rooms.value || []).slice(0, 3))
</script>
