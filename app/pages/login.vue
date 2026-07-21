<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Masuk ke KosFlow</h1>
        </div>
      </template>

      <UForm @submit="handleLogin" :state="{}" class="space-y-4">
        <UFormField label="Email" name="email" required>
          <UInput v-model="email" type="email" placeholder="email@example.com" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput v-model="password" type="password" placeholder="******" class="w-full" />
        </UFormField>

        <UAlert v-if="error" color="error" variant="soft" :title="error" icon="heroicons:exclamation-circle-20-solid" />

        <UButton type="submit" :loading="loading" block color="primary" size="lg">
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await navigateTo('/dashboard')
  } catch (e) {
    error.value = e.data?.statusMessage || 'Login gagal'
  } finally {
    loading.value = false
  }
}
</script>
