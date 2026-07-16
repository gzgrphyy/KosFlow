<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-3xl font-bold mb-6">Tambah Kamar</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nomor Kamar</label>
        <input v-model="roomNumber" type="text" required maxlength="20"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Tarif Bulanan (Rp)</label>
        <input v-model.number="monthlyRate" type="number" min="0" step="0.01" required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Status</label>
        <select v-model="status"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="AVAILABLE">Tersedia</option>
          <option value="MAINTENANCE">Perbaikan</option>
        </select>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <div class="flex gap-3">
        <button type="submit" :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Menyimpan...' : 'Simpan' }}
        </button>
        <NuxtLink to="/rooms"
          class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          Batal
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>

const roomNumber = ref('')
const monthlyRate = ref(0)
const status = ref('AVAILABLE')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/rooms', {
      method: 'POST',
      body: {
        roomNumber: roomNumber.value,
        monthlyRate: monthlyRate.value,
        status: status.value,
      },
    })
    await navigateTo('/rooms')
  } catch (e) {
    error.value = e.data?.statusMessage || 'Gagal menyimpan'
  } finally {
    loading.value = false
  }
}
</script>
