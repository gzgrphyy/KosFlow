<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-3xl font-bold mb-6">Tambah Penyewa</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input v-model="form.fullName" type="text" required maxlength="100"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">No. HP</label>
        <input v-model="form.phone" type="tel" required maxlength="20"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Email <span class="text-gray-400">(opsional)</span></label>
        <input v-model="form.email" type="email" maxlength="100"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Nomor KTP</label>
        <input v-model="form.ktpNumber" type="text" required maxlength="16"
          pattern="\d{16}" title="KTP harus 16 digit angka"
          placeholder="16 digit angka"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
        <p class="text-xs text-gray-400 mt-1">Nomor KTP akan dienkripsi sebelum disimpan.</p>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <div class="flex gap-3">
        <button type="submit" :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Menyimpan...' : 'Simpan' }}
        </button>
        <NuxtLink to="/tenants"
          class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          Batal
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  ktpNumber: '',
})
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''

  // Validasi client-side KTP
  if (!/^\d{16}$/.test(form.ktpNumber)) {
    error.value = 'Nomor KTP harus tepat 16 digit angka'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/tenants', {
      method: 'POST',
      body: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        ktpNumber: form.ktpNumber,
      },
    })
    await navigateTo('/tenants')
  } catch (e) {
    error.value = e.data?.statusMessage || 'Gagal menyimpan'
  } finally {
    loading.value = false
  }
}
</script>
