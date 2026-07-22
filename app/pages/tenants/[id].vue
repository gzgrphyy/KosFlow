<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/tenants" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Icon name="heroicons:arrow-left-20-solid" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Detail Penyewa</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ tenant?.fullName || 'Memuat...' }}</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-48 w-full" />
      <USkeleton class="h-40 w-full" />
      <USkeleton class="h-32 w-full" />
    </div>
    <div v-else-if="loadError" class="text-red-500 text-center py-8">{{ loadError }}</div>

    <template v-else>
      <!-- Card: Data Penyewa -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-gray-900 dark:text-white">Data Penyewa</h2>
            <UBadge color="neutral" variant="subtle" size="sm">ID: {{ tenant?.id?.slice(0, 8) }}...</UBadge>
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.fullName" maxlength="100" class="w-full" />
            </UFormField>
            <UFormField label="No. HP" required>
              <UInput v-model="form.phone" maxlength="20" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Email" hint="Opsional">
            <UInput v-model="form.email" type="email" class="w-full" />
          </UFormField>

          <!-- KTP Section -->
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Nomor KTP</span>
              <UButton color="primary" variant="soft" size="sm" :loading="ktpLoading" @click="handleViewKtp">
                {{ ktpVisible ? 'Sembunyikan' : 'Lihat KTP' }}
              </UButton>
            </div>

            <p class="font-mono text-base text-gray-600 dark:text-gray-400 tracking-widest">{{ tenant?.ktpMasked }}</p>

            <UAlert v-if="ktpVisible" color="warning" variant="soft" icon="heroicons:eye-20-solid">
              <template #description>
                <div class="flex items-center justify-between">
                  <span class="font-mono text-lg font-bold tracking-widest text-gray-900 dark:text-white">{{ ktpPlain }}</span>
                  <span class="text-xs text-orange-600 dark:text-orange-400 font-medium">Hilang dalam {{ ktpCountdown }} detik</span>
                </div>
                <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">Akses ini dicatat di audit log</p>
              </template>
            </UAlert>
            <p v-if="ktpError" class="text-red-500 text-xs">{{ ktpError }}</p>

            <div>
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ganti KTP (biarkan kosong jika tidak ingin mengubah)</label>
              <UInput v-model="form.ktpNumber" placeholder="16 digit angka baru" maxlength="16" class="w-full font-mono" />
            </div>
          </div>

          <UAlert v-if="submitError" color="error" variant="soft" :title="submitError" icon="heroicons:exclamation-circle-20-solid" />

          <div class="flex items-center justify-between pt-2">
            <UButton v-if="user?.role === 'OWNER'" color="error" variant="ghost" class="dark:text-red-400" :loading="deleting" @click="handleDelete">
              Hapus Penyewa
            </UButton>
            <div v-else />
            <div class="flex gap-3">
              <UButton to="/tenants" color="gray" variant="outline">Batal</UButton>
              <UButton type="submit" :loading="saving" color="primary">Simpan</UButton>
            </div>
          </div>
        </form>
      </UCard>

      <!-- Card: Kamar & Sewa -->
      <UCard class="mb-6">
        <template #header>
          <h2 class="font-semibold text-gray-900 dark:text-white">Kamar & Sewa</h2>
        </template>

        <template v-if="!activeTenancy">
          <div class="text-center py-6">
            <Icon name="heroicons:home-20-solid" class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Penyewa ini belum menempati kamar</p>
          </div>
          <form @submit.prevent="handleAssign" class="space-y-4">
            <UFormField label="Pilih Kamar" required>
              <USelect v-model="assignForm.roomId" :items="roomOptions" placeholder="-- Pilih kamar tersedia --" class="w-full" />
              <p v-if="availableRooms?.length === 0" class="text-xs text-gray-400 mt-1">Tidak ada kamar tersedia saat ini.</p>
            </UFormField>
            <UFormField label="Tanggal Mulai" required>
              <UInput v-model="assignForm.startDate" type="date" class="w-full" />
            </UFormField>
            <UAlert v-if="assignError" color="error" variant="soft" :title="assignError" icon="heroicons:exclamation-circle-20-solid" />
            <UButton type="submit" color="primary" :loading="assigning">Assign ke Kamar</UButton>
          </form>
        </template>

        <template v-else>
          <div class="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div>
              <p class="font-semibold text-green-800 dark:text-green-300">
                Kamar {{ activeTenancy.room.roomNumber }}
              </p>
              <p class="text-sm text-green-700 dark:text-green-400">Mulai {{ formatDate(activeTenancy.startDate) }}</p>
            </div>
            <UButton color="error" variant="soft" size="sm" @click="showEndForm = !showEndForm">
              Akhiri Sewa
            </UButton>
          </div>

          <form v-if="showEndForm" @submit.prevent="handleEndTenancy" class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <UFormField label="Tanggal Selesai" required>
              <UInput v-model="endForm.endDate" type="date" class="w-full" />
            </UFormField>
            <UAlert v-if="endError" color="error" variant="soft" :title="endError" icon="heroicons:exclamation-circle-20-solid" />
            <div class="flex gap-3">
              <UButton type="submit" color="error" :loading="ending">Konfirmasi Akhiri Sewa</UButton>
              <UButton color="gray" variant="outline" @click="showEndForm = false">Batal</UButton>
            </div>
          </form>
        </template>
      </UCard>

      <!-- Card: Riwayat Kamar -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-900 dark:text-white">Riwayat Kamar</h2>
        </template>

        <div v-if="!tenant?.tenancies?.length" class="text-sm text-gray-400 text-center py-6">Belum pernah menempati kamar.</div>

        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kamar</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarif</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mulai</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selesai</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="t in tenant.tenancies" :key="t.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ t.room.roomNumber }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Rp {{ Number(t.room.monthlyRate).toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(t.startDate) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ t.endDate ? formatDate(t.endDate) : '—' }}</td>
              <td class="px-4 py-3">
                <UBadge :color="t.status === 'ACTIVE' ? 'success' : 'neutral'" variant="subtle" size="sm">
                  {{ t.status === 'ACTIVE' ? 'Aktif' : 'Selesai' }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id
const { user } = useUserSession()

const tenant = ref(null)
const loading = ref(true)
const loadError = ref('')

const activeTenancy = computed(() =>
  tenant.value?.tenancies?.find(t => t.status === 'ACTIVE') ?? null
)

const availableRooms = ref([])
const assignForm = reactive({ roomId: '', startDate: '' })
const assigning = ref(false)
const assignError = ref('')

const showEndForm = ref(false)
const endForm = reactive({ endDate: '' })
const ending = ref(false)
const endError = ref('')

const roomOptions = computed(() =>
  availableRooms.value.map(r => ({
    label: `Kamar ${r.roomNumber} — Rp ${Number(r.monthlyRate).toLocaleString('id-ID')}/bln`,
    value: r.id,
  }))
)

async function loadAvailableRooms() {
  try { availableRooms.value = await $fetch('/api/rooms/available') }
  catch { availableRooms.value = [] }
}

async function handleAssign() {
  assignError.value = ''
  assigning.value = true
  try {
    await $fetch(`/api/tenants/${id}/assign`, {
      method: 'POST',
      body: { roomId: assignForm.roomId, startDate: assignForm.startDate },
    })
    assignForm.roomId = ''
    assignForm.startDate = ''
    await loadTenant()
    await loadAvailableRooms()
  } catch (e) {
    assignError.value = e.data?.statusMessage || 'Gagal assign kamar'
  } finally {
    assigning.value = false
  }
}

async function handleEndTenancy() {
  if (!activeTenancy.value) return
  endError.value = ''
  ending.value = true
  try {
    await $fetch(`/api/tenants/${id}/endtenancy`, {
      method: 'POST',
      body: { tenancyId: activeTenancy.value.id, endDate: endForm.endDate },
    })
    showEndForm.value = false
    endForm.endDate = ''
    await loadTenant()
    await loadAvailableRooms()
  } catch (e) {
    endError.value = e.data?.statusMessage || 'Gagal mengakhiri sewa'
  } finally {
    ending.value = false
  }
}

const form = reactive({ fullName: '', phone: '', email: '', ktpNumber: '' })
const saving = ref(false)
const submitError = ref('')
const deleting = ref(false)

const ktpPlain = ref('')
const ktpVisible = ref(false)
const ktpLoading = ref(false)
const ktpError = ref('')
const ktpCountdown = ref(10)
let ktpTimer = null

async function loadTenant() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await $fetch(`/api/tenants/${id}`)
    tenant.value = data
    form.fullName = data.fullName
    form.phone = data.phone
    form.email = data.email ?? ''
  } catch (e) {
    loadError.value = e.data?.statusMessage || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadTenant(); loadAvailableRooms() })

async function handleViewKtp() {
  ktpError.value = ''
  ktpLoading.value = true
  ktpVisible.value = false
  clearInterval(ktpTimer)
  try {
    const res = await $fetch(`/api/tenants/${id}/ktp`)
    ktpPlain.value = res.ktpNumber
    ktpVisible.value = true
    ktpCountdown.value = 10
    ktpTimer = setInterval(() => {
      ktpCountdown.value--
      if (ktpCountdown.value <= 0) {
        clearInterval(ktpTimer)
        ktpVisible.value = false
        ktpPlain.value = ''
      }
    }, 1000)
  } catch (e) {
    ktpError.value = e.data?.statusMessage || 'Gagal mengambil data KTP'
  } finally {
    ktpLoading.value = false
  }
}

onUnmounted(() => clearInterval(ktpTimer))

async function handleSubmit() {
  submitError.value = ''
  if (form.ktpNumber && !/^\d{16}$/.test(form.ktpNumber)) {
    submitError.value = 'Nomor KTP baru harus tepat 16 digit angka'
    return
  }
  saving.value = true
  try {
    const body = { fullName: form.fullName, phone: form.phone, email: form.email || undefined }
    if (form.ktpNumber) body.ktpNumber = form.ktpNumber
    await $fetch(`/api/tenants/${id}`, { method: 'PUT', body })
    await navigateTo('/tenants')
  } catch (e) {
    submitError.value = e.data?.statusMessage || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!confirm(`Hapus penyewa "${tenant.value?.fullName}"?`)) return
  deleting.value = true
  try {
    await $fetch(`/api/tenants/${id}`, { method: 'DELETE' })
    await navigateTo('/tenants')
  } catch (e) {
    submitError.value = e.data?.statusMessage || 'Gagal menghapus'
  } finally {
    deleting.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
</script>
