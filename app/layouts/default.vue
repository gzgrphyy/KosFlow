<template>
  <UApp>
    <div class="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 transition-colors">
    <nav v-if="loggedIn" class="sticky top-0 z-50 glass">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14 items-center">
          <div class="flex items-center gap-8">
            <NuxtLink to="/dashboard" class="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
              KosFlow
            </NuxtLink>
            <div class="flex items-center gap-1">
              <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
                class="relative px-3 py-1.5 text-sm font-medium transition-colors"
                :class="isActive(link.to)
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
                {{ link.label }}
                <span v-if="isActive(link.to)"
                  class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-500 rounded-full" />
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UButton
              :icon="isDark ? 'heroicons:moon-20-solid' : 'heroicons:sun-20-solid'"
              variant="ghost"
              color="gray"
              size="sm"
              @click="toggleDark"
            />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ user?.name }}</span>
                    <UTooltip text="Logout" :delay-duration="300">
                <UButton icon="heroicons:arrow-right-start-on-rectangle-20-solid" color="gray" variant="ghost" size="sm" @click="logout" />
              </UTooltip>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
  </UApp>
</template>

<script setup>

const { loggedIn, user, clear } = useUserSession()
const route = useRoute()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rooms', label: 'Kamar' },
  { to: '/tenants', label: 'Penyewa' },
  { to: '/invoices', label: 'Tagihan' },
  { to: '/payments', label: 'Pembayaran' },
]

function isActive(to) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>
