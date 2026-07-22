<template>
  <div class="max-w-xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/rooms" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Icon name="heroicons:arrow-left-20-solid" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Kamar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Ubah detail kamar</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <USkeleton class="h-48 w-full max-w-xl mx-auto" />
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>

    <UCard v-else>
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UFormField label="Nomor Kamar" name="roomNumber" required>
          <UInput v-model="roomNumber" maxlength="20" class="w-full" />
        </UFormField>

        <UFormField label="Tarif Bulanan (Rp)" name="monthlyRate" required>
          <UInput v-model.number="monthlyRate" type="number" min="0" class="w-full" />
        </UFormField>

        <UFormField label="Status" name="status">
          <USelect v-model="status" :items="statusOptions" class="w-full" />
        </UFormField>

        <UAlert v-if="submitError" color="error" variant="soft" :title="submitError" icon="heroicons:exclamation-circle-20-solid" />

        <div class="flex items-center justify-between pt-2">
          <UButton color="error" variant="ghost" class="dark:text-red-400" :loading="deleting" @click="handleDelete">
            {{ deleting ? 'Menghapus...' : 'Hapus kamar ini' }}
          </UButton>
          <div class="flex gap-3">
            <UButton to="/rooms" color="gray" variant="outline" class="text-gray-600 dark:text-gray-300">Batal</UButton>
            <UButton type="submit" :loading="saving" color="primary">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </UButton>
          </div>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

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

const statusOptions = [
  { label: 'Tersedia', value: 'AVAILABLE' },
  { label: 'Perbaikan', value: 'MAINTENANCE' },
]

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
