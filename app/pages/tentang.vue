<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <!-- Header -->
    <section class="pt-16 md:pt-24 pb-12 text-center">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tentang KosFlow</h1>
      <p class="text-gray-500 max-w-xl mx-auto">Kos nyaman, aman, dan terjangkau — tempat terbaik untuk tinggal dan produktif.</p>
    </section>

    <!-- Cerita Kos -->
    <section class="pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-50 overflow-hidden shadow-lg">
          <div class="w-full h-full flex items-center justify-center text-teal-300">
            <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Cerita Kami</h2>
          <div class="space-y-4 text-gray-600 leading-relaxed text-sm">
            <p>
              KosFlow berdiri sejak 2020 dengan visi menyediakan tempat tinggal yang nyaman, aman, dan terjangkau 
              bagi mahasiswa dan pekerja. Berawal dari satu bangunan kos dengan 5 kamar, kini kami telah berkembang 
              menjadi 12 kamar dengan berbagai fasilitas lengkap.
            </p>
            <p>
              Kami percaya bahwa tempat tinggal yang baik adalah fondasi untuk aktivitas yang produktif. 
              Itulah mengapa setiap kamar dirancang dengan memperhatikan kenyamanan, privasi, dan kebutuhan 
              penghuni sehari-hari.
            </p>
            <p>
              Lebih dari sekadar kos, kami ingin menciptakan komunitas yang saling mendukung. 
              Dengan lingkungan yang bersih, aman, dan tetangga yang ramah, KosFlow adalah pilihan tepat 
              untuk tempat tinggalmu berikutnya.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Peraturan Kos -->
    <section class="pb-16">
      <div class="bg-gray-50 rounded-2xl p-8 md:p-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Peraturan Kos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="rule in rules" :key="rule.label" class="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" :class="rule.bg">
              <svg class="w-4 h-4" :class="rule.color" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path v-if="rule.icon === 'clock'" stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path v-if="rule.icon === 'user-group'" stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                <path v-if="rule.icon === 'no-smoke'" stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                <path v-if="rule.icon === 'volume-up'" stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path v-if="rule.icon === 'pet'" stroke-linecap="round" stroke-linejoin="round" d="M14 10h.01M10 10h.01M12 16c3.866 0 7-1.343 7-3 0-1.657-3.134-3-7-3s-7 1.343-7 3c0 1.657 3.134 3 7 3z" />
                <path v-if="rule.icon === 'clean'" stroke-linecap="round" stroke-linejoin="round" d="M3 12h1m8-9v9m0 0v9m0-9h9m-9 0H4" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ rule.label }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ rule.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lokasi -->
    <section class="pb-20">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Lokasi Kos</h2>
      <div class="aspect-[21/9] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
        <div class="w-full h-full flex items-center justify-center text-gray-400">
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-sm text-gray-500">Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota 12345</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'public' })

const rules = [
  { label: 'Jam Bertamu', description: 'Bertamu maksimal sampai pukul 22.00 WIB. Menginap harus izin owner.', icon: 'clock', bg: 'bg-blue-50', color: 'text-blue-600' },
  { label: 'Tidak Bisa Bawa Pasangan', description: 'Kos khusus putra/putri. Tidak diperkenankan membawa pasangan menginap.', icon: 'user-group', bg: 'bg-pink-50', color: 'text-pink-600' },
  { label: 'Dilarang Merokok', description: 'Merokok hanya di area yang sudah disediakan, tidak di dalam kamar.', icon: 'no-smoke', bg: 'bg-red-50', color: 'text-red-600' },
  { label: 'Jaga Ketertiban', description: 'Tidak boleh membuat keributan yang mengganggu penghuni lain, terutama malam hari.', icon: 'volume-up', bg: 'bg-yellow-50', color: 'text-yellow-600' },
  { label: 'Tidak Boleh Pelihara Hewan', description: 'Dilarang memelihara hewan di area kos demi kenyamanan bersama.', icon: 'pet', bg: 'bg-orange-50', color: 'text-orange-600' },
  { label: 'Jaga Kebersihan', description: 'Setiap penghuni wajib menjaga kebersihan kamar dan area bersama.', icon: 'clean', bg: 'bg-teal-50', color: 'text-teal-600' },
]
</script>
