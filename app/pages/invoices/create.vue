<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Generate Tagihan</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow space-y-5">

      <!-- Pilih Tenancy -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Penyewa & Kamar</label>
        <select v-model="form.tenancyId" required @change="onTenancyChange"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>-- Pilih penyewa aktif --</option>
          <option v-for="t in activeTenancies" :key="t.id" :value="t.id">
            {{ t.tenant.fullName }} — Kamar {{ t.room.roomNumber }}
            (Rp {{ Number(t.room.monthlyRate).toLocaleString('id-ID') }}/bln)
          </option>
        </select>
        <p v-if="activeTenancies?.length === 0" class="text-xs text-gray-400 mt-1">
          Tidak ada penyewa aktif. Assign penyewa ke kamar terlebih dahulu.
        </p>
      </div>

      <!-- Periode -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Periode (Bulan)</label>
          <input v-model="form.period" type="month" required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Jatuh Tempo</label>
          <input v-model="form.dueDate" type="date" required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <!-- Invoice Items -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-medium text-gray-700">Item Tagihan</label>
          <button type="button" @click="addItem"
            class="text-sm text-blue-600 hover:text-blue-800">+ Tambah Item</button>
        </div>

        <div class="space-y-2">
          <div v-for="(item, idx) in form.items" :key="idx"
            class="flex gap-2 items-center">
            <input v-model="item.description" type="text" placeholder="Keterangan (misal: Sewa Kamar)" required
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input v-model.number="item.amount" type="number" min="0" placeholder="Jumlah (Rp)" required
              class="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" @click="removeItem(idx)"
              :disabled="form.items.length === 1"
              class="text-red-500 hover:text-red-700 disabled:opacity-30 text-lg px-1">×</button>
          </div>
        </div>

        <!-- Total -->
        <div class="mt-3 pt-3 border-t flex justify-between items-center">
          <span class="text-sm font-medium text-gray-600">Total</span>
          <span class="text-lg font-bold text-gray-900">
            Rp {{ grandTotal.toLocaleString('id-ID') }}
          </span>
        </div>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <div class="flex gap-3">
        <button type="submit" :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Menyimpan...' : 'Generate Tagihan' }}
        </button>
        <NuxtLink to="/invoices"
          class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          Batal
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>

// Load semua tenancy aktif untuk dropdown
const { data: activeTenancies } = await useFetch('/api/invoices/active-tenancies')

// Default period = bulan ini
const now = new Date()
const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
// Default due date = tanggal 10 bulan ini
const defaultDue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-10`

const form = reactive({
  tenancyId: '',
  period: defaultPeriod,
  dueDate: defaultDue,
  items: [{ description: 'Sewa Kamar', amount: 0 }],
})

const error = ref('')
const loading = ref(false)

// Saat pilih tenancy, isi default amount item pertama dari monthlyRate kamar
function onTenancyChange() {
  const selected = activeTenancies.value?.find(t => t.id === form.tenancyId)
  if (selected && form.items.length > 0) {
    form.items[0].description = 'Sewa Kamar'
    form.items[0].amount = Number(selected.room.monthlyRate)
  }
}

function addItem() {
  form.items.push({ description: '', amount: 0 })
}

function removeItem(idx) {
  if (form.items.length === 1) return
  form.items.splice(idx, 1)
}

const grandTotal = computed(() =>
  form.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
)

async function handleSubmit() {
  error.value = ''

  if (form.items.some(i => !i.description.trim() || i.amount <= 0)) {
    error.value = 'Semua item harus punya keterangan dan jumlah lebih dari 0'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/invoices', {
      method: 'POST',
      body: {
        tenancyId: form.tenancyId,
        period: form.period,
        dueDate: form.dueDate,
        items: form.items.map(i => ({
          description: i.description.trim(),
          amount: Number(i.amount),
        })),
      },
    })
    await navigateTo('/invoices')
  } catch (e) {
    error.value = e.data?.statusMessage || 'Gagal generate tagihan'
  } finally {
    loading.value = false
  }
}
</script>
