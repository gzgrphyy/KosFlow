<template>
  <div class="max-w-xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/tenants" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Icon name="heroicons:arrow-left-20-solid" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tambah Penyewa</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Data penyewa baru akan dienkripsi</p>
      </div>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <UFormField label="Nama Lengkap" name="fullName" required>
            <UInput v-model="form.fullName" placeholder="Nama sesuai KTP" maxlength="100" class="w-full" />
          </UFormField>
          <UFormField label="No. HP" name="phone" required>
            <UInput v-model="form.phone" placeholder="08123456789" maxlength="20" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Email" name="email" hint="Opsional">
          <UInput v-model="form.email" type="email" placeholder="email@example.com" maxlength="100" class="w-full" />
        </UFormField>

        <UFormField label="Nomor KTP" name="ktpNumber" required>
          <UInput v-model="form.ktpNumber" placeholder="16 digit angka" maxlength="16" class="w-full font-mono tracking-wider" />
          <template #hint>
            <div class="flex items-center gap-1 mt-1">
              <Icon name="heroicons:lock-closed-20-solid" class="w-3 h-3 text-gray-400 dark:text-gray-500" />
              <span class="text-xs text-gray-400 dark:text-gray-500">Akan dienkripsi sebelum disimpan (AES-256-GCM)</span>
            </div>
          </template>
        </UFormField>

        <UAlert v-if="error" color="error" variant="soft" :title="error" icon="heroicons:exclamation-circle-20-solid" />

        <div class="flex gap-3 pt-2">
          <UButton type="submit" :loading="loading" color="primary">
            {{ loading ? 'Menyimpan...' : 'Simpan' }}
          </UButton>
          <UButton to="/tenants" color="gray" variant="outline" class="text-gray-600 dark:text-gray-300">Batal</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

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
