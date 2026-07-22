<template>
  <div class="min-h-screen bg-white text-earth-black">
    <!-- ═══════════ NAVBAR (Earthon-style) ═══════════ -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      :class="scrolled ? 'glass' : 'bg-transparent'"
    >
      <div class="container-public">
        <div class="flex items-center justify-between h-16 md:h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0 group">
            <div class="w-9 h-9 rounded-xl bg-earth-black flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200">
              K
            </div>
            <span class="font-bold text-lg tracking-tight text-earth-black font-heading">KosFlow</span>
          </NuxtLink>

          <!-- Desktop Nav — Earthon pill container exact match -->
          <div class="hidden md:flex items-center gap-4">
            <div
              class="flex items-center gap-0.5 px-2 py-1.5 rounded-full transition-all duration-500"
              :class="scrolled ? 'bg-earth-gray-100 shadow-sm' : 'bg-white/80 backdrop-blur-sm'"
              style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"
            >
              <NuxtLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out"
                :class="[
                  route.path === link.to
                    ? 'bg-earth-black text-white shadow-sm'
                    : 'text-earth-black/80 hover:bg-earth-black/5',
                ]"
              >
                {{ link.label }}
              </NuxtLink>
            </div>

            <!-- CTA Contact — Earthon yellow pill -->
            <NuxtLink
              to="/kontak"
              class="btn-yellow group relative px-6 py-2.5 overflow-hidden"
            >
              <span class="relative z-10 flex items-center gap-2">
                Hubungi Kami
                <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <span class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </NuxtLink>
          </div>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden p-2.5 rounded-full text-earth-black/70 hover:text-earth-black hover:bg-earth-gray-100 transition-colors duration-200"
            @click="mobileOpen = !mobileOpen"
            aria-label="Menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="mobileOpen"
        class="md:hidden border-t border-earth-gray-200 bg-white shadow-lg"
      >
        <div class="container-public py-4 space-y-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
            :class="route.path === link.to
              ? 'bg-earth-black text-white'
              : 'text-earth-black/70 hover:bg-earth-gray-100'"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
          <NuxtLink
            to="/kontak"
            class="btn-yellow w-full justify-center mt-2"
            @click="mobileOpen = false"
          >
            Hubungi Kami
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Spacer for fixed navbar -->
    <div class="h-16 md:h-20" />

    <!-- ═══════════ PAGE TRANSITION WRAPPER ═══════════ -->
    <main v-motion="{ initial: { opacity: 0 }, visibleOnce: { opacity: 1, transition: { duration: 400 } } }">
      <slot />
    </main>

    <!-- ═══════════ FOOTER (Earthon dark style) ═══════════ -->
    <footer class="bg-earth-black text-white">
      <div
        v-motion="{ initial: { y: 60, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { delay: 100, duration: 700, ease: 'easeOut' } } }"
        class="container-public py-16"
      >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <!-- Brand -->
          <div class="md:col-span-2">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 rounded-xl bg-earth-yellow flex items-center justify-center text-earth-black font-bold text-sm">
                K
              </div>
              <span class="font-bold text-lg tracking-tight font-heading text-white">KosFlow</span>
            </div>
            <p class="text-earth-gray-400 text-sm leading-relaxed max-w-sm">
              Kos nyaman dengan fasilitas lengkap dan harga bersahabat. Tempat tinggal ideal untuk mahasiswa & pekerja.
            </p>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              class="inline-flex items-center gap-2 mt-6 text-sm text-earth-yellow hover:text-white transition-colors duration-200 font-medium"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              0812-3456-7890
            </a>
          </div>

          <!-- Navigasi -->
          <div>
            <h3 class="font-semibold text-sm uppercase tracking-wider text-earth-gray-400 mb-4">Navigasi</h3>
            <ul class="space-y-3">
              <li v-for="link in navLinks" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="text-sm text-earth-gray-300 hover:text-earth-yellow transition-colors duration-200"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Kontak -->
          <div>
            <h3 class="font-semibold text-sm uppercase tracking-wider text-earth-gray-400 mb-4">Kontak</h3>
            <ul class="space-y-3 text-sm text-earth-gray-300">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-earth-yellow shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Jl. Contoh No. 123<br />Kelurahan, Kecamatan, Kota</span>
              </li>
              <li>
                <a href="https://wa.me/6281234567890" target="_blank" class="flex items-center gap-2 text-earth-yellow hover:text-white transition-colors duration-200 font-medium">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  0812-3456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-earth-gray-700">
        <div class="container-public py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-xs text-earth-gray-500">&copy; {{ new Date().getFullYear() }} KosFlow. All rights reserved.</p>
          <p class="text-xs text-earth-gray-500">Kos Nyaman untuk Aktivitasmu</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const route = useRoute()

const mobileOpen = ref(false)

const scrolled = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Kamar', to: '/kamar' },
  { label: 'Fasilitas', to: '/galeri' },
  { label: 'Tentang', to: '/tentang' },
  { label: 'Kontak', to: '/kontak' },
]
</script>
