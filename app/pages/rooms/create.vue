<template>
  <div class="max-w-xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/rooms" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Icon name="heroicons:arrow-left-20-solid" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tambah Kamar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Masukkan detail kamar baru</p>
      </div>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UFormField label="Nomor Kamar" name="roomNumber" required>
          <UInput v-model="roomNumber" placeholder="Contoh: 4A" maxlength="20" class="w-full" />
        </UFormField>

        <UFormField label="Tarif Bulanan (Rp)" name="monthlyRate" required>
          <UInput v-model.number="monthlyRate" type="number" min="0" placeholder="500000" class="w-full" />
        </UFormField>

        <UFormField label="Status" name="status">
          <USelect v-model="status" :items="statusOptions" class="w-full" />
        </UFormField>

        <UAlert v-if="error" color="error" variant="soft" :title="error" icon="heroicons:exclamation-circle-20-solid" />

        <div class="flex gap-3 pt-2">
          <UButton type="submit" :loading="loading" color="primary">
            {{ loading ? 'Menyimpan...' : 'Simpan' }}
          </UButton>
          <UButton to="/rooms" color="gray" variant="outline">Batal</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup>
const roomNumber = ref('')
const monthlyRate = ref(0)
const status = ref('AVAILABLE')
const error = ref('')
const loading = ref(false)

const statusOptions = [
  { label: 'Tersedia', value: 'AVAILABLE' },
  { label: 'Perbaikan', value: 'MAINTENANCE' },
]

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
