<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Detail Penyewa</h1>

    <div v-if="loading" class="text-gray-500">Memuat data...</div>
    <div v-else-if="loadError" class="text-red-600">{{ loadError }}</div>

    <template v-else>
      <!-- Form Edit -->
      <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow space-y-4 mb-6">
        <h2 class="text-lg font-semibold">Data Penyewa</h2>

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

        <!-- KTP Section -->
        <div class="border border-gray-200 rounded-md p-4 space-y-3">
          <label class="block text-sm font-medium text-gray-700">Nomor KTP</label>

          <!-- KTP Masked -->
          <p class="font-mono text-gray-600 text-lg tracking-wider">{{ tenant?.ktpMasked }}</p>

          <!-- Tombol Lihat KTP -->
          <button type="button" @click="handleViewKtp"
            :disabled="ktpLoading"
            class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50">
            {{ ktpLoading ? 'Memuat...' : '👁 Lihat KTP' }}
          </button>

          <!-- Modal KTP (inline, auto-hide 10 detik) -->
          <div v-if="ktpVisible"
            class="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs text-yellow-700 font-medium mb-1">⚠️ Akses ini dicatat di audit log</p>
                <p class="font-mono text-xl font-bold tracking-widest text-gray-900">{{ ktpPlain }}</p>
              </div>
              <button type="button" @click="ktpVisible = false"
                class="text-gray-400 hover:text-gray-600 text-xs ml-4">Sembunyikan</button>
            </div>
            <p class="text-xs text-yellow-600 mt-2">Otomatis tersembunyi dalam {{ ktpCountdown }} detik</p>
          </div>
          <p v-if="ktpError" class="text-red-600 text-sm">{{ ktpError }}</p>

          <!-- Update KTP (opsional) -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Ganti KTP (kosongkan jika tidak ingin mengubah)</label>
            <input v-model="form.ktpNumber" type="text" maxlength="16"
              pattern="\d{16}" title="KTP harus 16 digit angka"
              placeholder="Isi 16 digit angka baru untuk mengganti"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
          </div>
        </div>

        <p v-if="submitError" class="text-red-600 text-sm">{{ submitError }}</p>

        <div class="flex justify-between">
          <!-- Hapus (Owner only) -->
          <button v-if="user?.role === 'OWNER'" type="button" @click="handleDelete"
            :disabled="deleting"
            class="text-red-600 hover:text-red-800 text-sm self-center disabled:opacity-50">
            {{ deleting ? 'Menghapus...' : 'Hapus Penyewa' }}
          </button>
          <div v-else></div>

          <div class="flex gap-3">
            <NuxtLink to="/tenants"
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

      <!-- Section: Kamar & Sewa -->
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">Kamar & Sewa</h2>

        <!-- Tidak ada tenancy aktif → form Assign -->
        <template v-if="!activeTenancy">
          <p class="text-sm text-gray-500 mb-4">Penyewa ini belum menempati kamar.</p>
          <form @submit.prevent="handleAssign" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Pilih Kamar</label>
              <select v-model="assignForm.roomId" required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>-- Pilih kamar tersedia --</option>
                <option v-for="r in availableRooms" :key="r.id" :value="r.id">
                  Kamar {{ r.roomNumber }} — Rp {{ Number(r.monthlyRate).toLocaleString('id-ID') }}/bln
                </option>
              </select>
              <p v-if="availableRooms?.length === 0" class="text-xs text-gray-400 mt-1">Tidak ada kamar tersedia saat ini.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
              <input v-model="assignForm.startDate" type="date" required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <p v-if="assignError" class="text-red-600 text-sm">{{ assignError }}</p>
            <button type="submit" :disabled="assigning"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm">
              {{ assigning ? 'Memproses...' : 'Assign ke Kamar' }}
            </button>
          </form>
        </template>

        <!-- Ada tenancy aktif → info + tombol Akhiri Sewa -->
        <template v-else>
          <div class="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div class="flex-1">
              <p class="font-medium text-green-800">Kamar {{ activeTenancy.room.roomNumber }}</p>
              <p class="text-sm text-green-700">Mulai: {{ formatDate(activeTenancy.startDate) }}</p>
            </div>
            <button type="button" @click="showEndForm = !showEndForm"
              class="text-sm text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded-md">
              Akhiri Sewa
            </button>
          </div>
          <form v-if="showEndForm" @submit.prevent="handleEndTenancy" class="mt-4 space-y-3 border-t pt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
              <input v-model="endForm.endDate" type="date" required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <p v-if="endError" class="text-red-600 text-sm">{{ endError }}</p>
            <div class="flex gap-2">
              <button type="submit" :disabled="ending"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm">
                {{ ending ? 'Memproses...' : 'Konfirmasi Akhiri Sewa' }}
              </button>
              <button type="button" @click="showEndForm = false"
                class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
                Batal
              </button>
            </div>
          </form>
        </template>
      </div>

      <!-- Riwayat Tenancy -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Riwayat Kamar</h2>
        <div v-if="!tenant?.tenancies?.length" class="text-gray-400 text-sm">Belum pernah menempati kamar.</div>
        <table v-else class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-2 text-gray-500 font-medium">Kamar</th>
              <th class="text-left px-4 py-2 text-gray-500 font-medium">Tarif</th>
              <th class="text-left px-4 py-2 text-gray-500 font-medium">Mulai</th>
              <th class="text-left px-4 py-2 text-gray-500 font-medium">Selesai</th>
              <th class="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in tenant.tenancies" :key="t.id">
              <td class="px-4 py-2 font-medium">{{ t.room.roomNumber }}</td>
              <td class="px-4 py-2">Rp {{ Number(t.room.monthlyRate).toLocaleString('id-ID') }}</td>
              <td class="px-4 py-2">{{ formatDate(t.startDate) }}</td>
              <td class="px-4 py-2">{{ t.endDate ? formatDate(t.endDate) : '—' }}</td>
              <td class="px-4 py-2">
                <span :class="t.status === 'ACTIVE'
                  ? 'px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                  : 'px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'">
                  {{ t.status === 'ACTIVE' ? 'Aktif' : 'Selesai' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>

const route = useRoute()
const id = route.params.id
const { user } = useUserSession()

// State data
const tenant = ref(null)
const loading = ref(true)
const loadError = ref('')

// Computed: tenancy aktif
const activeTenancy = computed(() =>
  tenant.value?.tenancies?.find(t => t.status === 'ACTIVE') ?? null
)

// State assign ke kamar
const availableRooms = ref([])
const assignForm = reactive({ roomId: '', startDate: '' })
const assigning = ref(false)
const assignError = ref('')

// State akhiri sewa
const showEndForm = ref(false)
const endForm = reactive({ endDate: '' })
const ending = ref(false)
const endError = ref('')

async function loadAvailableRooms() {
  try {
    availableRooms.value = await $fetch('/api/rooms/available')
  } catch {
    availableRooms.value = []
  }
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

// State form
const form = reactive({ fullName: '', phone: '', email: '', ktpNumber: '' })
const saving = ref(false)
const submitError = ref('')
const deleting = ref(false)

// State KTP reveal
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

onMounted(() => {
  loadTenant()
  loadAvailableRooms()
})

async function handleViewKtp() {
  ktpError.value = ''
  ktpLoading.value = true
  // Sembunyikan yang sebelumnya dulu
  ktpVisible.value = false
  clearInterval(ktpTimer)
  try {
    const res = await $fetch(`/api/tenants/${id}/ktp`)
    ktpPlain.value = res.ktpNumber
    ktpVisible.value = true
    ktpCountdown.value = 10
    // Auto-hide countdown 10 detik
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

  // Validasi KTP jika diisi
  if (form.ktpNumber && !/^\d{16}$/.test(form.ktpNumber)) {
    submitError.value = 'Nomor KTP baru harus tepat 16 digit angka'
    return
  }

  saving.value = true
  try {
    const body = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email || undefined,
    }
    // Hanya sertakan ktpNumber jika user mengisinya
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
  if (!confirm(`Hapus penyewa "${tenant.value?.fullName}"? Tindakan ini tidak bisa dibatalkan.`)) return
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
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
</script>
