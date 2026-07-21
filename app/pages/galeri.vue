<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <!-- Header -->
    <section class="pt-16 md:pt-24 pb-12 text-center">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fasilitas & Galeri</h1>
      <p class="text-gray-500 max-w-xl mx-auto">Lihat langsung fasilitas dan suasana KosFlow.</p>
    </section>

    <!-- Galeri Foto -->
    <section class="pb-16">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Galeri Kos</h2>
      <PublicGalleryGrid :images="galleryImages" @select="openLightbox" />
    </section>

    <!-- Fasilitas Lengkap -->
    <section class="pb-20">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Fasilitas Lengkap</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="fac in facilityList" :key="fac.label">
          <PublicFacilityBadge v-bind="fac" />
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="lightboxActive"
        class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        @click="closeLightbox"
      >
        <button class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors" @click="closeLightbox">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          :src="galleryImages[activeIndex]?.url"
          :alt="galleryImages[activeIndex]?.caption"
          class="max-w-full max-h-[90vh] rounded-xl object-contain"
          @click.stop
        />
        <button
          v-if="activeIndex > 0"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          @click.stop="activeIndex--"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="activeIndex < galleryImages.length - 1"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          @click.stop="activeIndex++"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'public' })

const lightboxActive = ref(false)
const activeIndex = ref(0)

const galleryImages = [
  { url: '/foto/tampakdepan.jpg', caption: 'Tampak Depan Kos' },
  { url: '/foto/ruangtamu.jpg', caption: 'Ruang Tamu' },
  { url: '/foto/dapur.jpg', caption: 'Dapur Bersama' },
  { url: '/foto/areaparkir.jpg', caption: 'Area Parkir' },
  { url: '/foto/koridor.jpg', caption: 'Koridor Lantai 2' },
  { url: '/foto/ruangsantai.jpg', caption: 'Ruang Santai' },
  { url: '/foto/kamarmandi.jpg', caption: 'Kamar Mandi' },
  { url: '/foto/tamanbelakang.jpeg', caption: 'Taman Belakang' },
]

const facilityList = [
  { label: 'WiFi Cepat 50Mbps', description: 'Internet stabil untuk belajar & kerja', icon: 'wifi' },
  { label: 'AC Dingin', description: 'AC split di setiap kamar', icon: 'ac' },
  { label: 'Kamar Mandi Dalam', description: 'Kamar mandi pribadi di setiap kamar', icon: 'bathroom' },
  { label: 'Dapur Bersama', description: 'Dapur lengkap dengan kompor & kulkas', icon: 'kitchen' },
  { label: 'Parkir Motor', description: 'Parkir luas & aman untuk motor', icon: 'parking' },
  { label: 'Keamanan 24 Jam', description: 'CCTV & satpam 24 jam', icon: 'security' },
  { label: 'TV Kabel', description: 'TV dengan saluran kabel di ruang bersama', icon: 'tv' },
  { label: 'Air Panas', description: 'Water heater di kamar mandi', icon: 'water' },
  { label: 'Listrik Token', description: 'Listrik prabayar, isi sendiri sesuai pemakaian', icon: 'tv' },
]

function openLightbox(idx) {
  activeIndex.value = idx
  lightboxActive.value = true
}

function closeLightbox() {
  lightboxActive.value = false
}
</script>
