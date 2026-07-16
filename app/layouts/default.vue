<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="loggedIn" class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex gap-6">
            <NuxtLink to="/" class="font-bold text-lg">KosFlow</NuxtLink>
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">Dashboard</NuxtLink>
            <NuxtLink to="/rooms" class="text-gray-600 hover:text-gray-900">Kamar</NuxtLink>
            <NuxtLink to="/tenants" class="text-gray-600 hover:text-gray-900">Penyewa</NuxtLink>
            <NuxtLink to="/invoices" class="text-gray-600 hover:text-gray-900">Tagihan</NuxtLink>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ user?.name }}</span>
            <button @click="logout" class="text-sm text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>
