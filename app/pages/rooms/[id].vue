<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-3xl font-bold mb-6">Edit Kamar</h1>

    <div v-if="loading" class="text-gray-500">Memuat data...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow space-y-4">
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

      <p v-if="submitError" class="text-red-600 text-sm">{{ submitError }}</p>

      <div class="flex justify-between">
        <button type="button" @click="handleDelete"
          class="text-red-600 hover:text-red-800 text-sm self-center"
          :disabled="deleting">
          {{ deleting ? 'Menghapus...' : 'Hapus kamar ini' }}
        </button>
        <div class="flex gap-3">
          <NuxtLink to="/rooms"
            class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            Batal
          </NuxtLink>
          <button type="submit" :disabled="saving"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>

const route = useRoute()
const id = route.params.id

const roomNumber = ref('')
const monthlyRate = ref(0)
const status = ref('AVAILABLE')
const loading = ref(true)
const error = ref('')
const submitError = ref('')
const saving = ref(false)
const deleting = ref(false)

async function loadRoom() {
  loading.value = true
  error.value = ''
  try {
    const room = await $fetch(`/api/rooms/${id}`)
    roomNumber.value = room.roomNumber
    monthlyRate.value = Number(room.monthlyRate)
    status.value = room.status
  } catch (e) {
    error.value = e.data?.statusMessage || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

onMounted(loadRoom)

async function handleSubmit() {
  submitError.value = ''
  saving.value = true
  try {
    await $fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      body: {
        roomNumber: roomNumber.value,
        monthlyRate: monthlyRate.value,
        status: status.value,
      },
    })
    await navigateTo('/rooms')
  } catch (e) {
    submitError.value = e.data?.statusMessage || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!confirm('Hapus kamar ini?')) return
  deleting.value = true
  try {
    await $fetch(`/api/rooms/${id}`, { method: 'DELETE' })
    await navigateTo('/rooms')
  } catch (e) {
    submitError.value = e.data?.statusMessage || 'Gagal menghapus'
  } finally {
    deleting.value = false
  }
}
</script>
