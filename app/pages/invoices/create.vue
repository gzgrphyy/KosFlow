<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/invoices" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Icon name="heroicons:arrow-left-20-solid" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Generate Tagihan</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Buat tagihan untuk penyewa</p>
      </div>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <UFormField label="Penyewa & Kamar" required>
          <USelect v-model="form.tenancyId" :items="tenancyOptions" placeholder="-- Pilih penyewa aktif --" class="w-full" @change="onTenancyChange" />
          <p v-if="activeTenancies?.length === 0" class="text-xs text-gray-400 mt-1">Tidak ada penyewa aktif.</p>
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <UFormField label="Periode (Bulan)" required>
            <UInput v-model="form.period" type="month" class="w-full" />
          </UFormField>
          <UFormField label="Jatuh Tempo" required>
            <UInput v-model="form.dueDate" type="date" class="w-full" />
          </UFormField>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Item Tagihan</span>
            <UButton color="primary" variant="soft" size="2xs" @click="addItem">+ Tambah Item</UButton>
          </div>

          <div class="space-y-3">
            <div v-for="(item, idx) in form.items" :key="idx" class="flex gap-3 items-start">
              <UInput v-model="item.description" placeholder="Keterangan" class="flex-1" />
              <UInput v-model.number="item.amount" type="number" min="0" placeholder="Rp" class="w-36" />
              <UButton icon="heroicons:x-mark-20-solid" color="gray" variant="ghost" size="sm" class="text-gray-600 dark:text-gray-300" :disabled="form.items.length === 1" @click="removeItem(idx)" />
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">
              Rp {{ grandTotal.toLocaleString('id-ID') }}
            </span>
          </div>
        </div>

        <UAlert v-if="error" color="error" variant="soft" :title="error" icon="heroicons:exclamation-circle-20-solid" />

        <div class="flex gap-3 pt-2">
          <UButton type="submit" :loading="loading" color="primary" size="lg">
            {{ loading ? 'Menyimpan...' : 'Generate Tagihan' }}
          </UButton>
          <UButton to="/invoices" color="gray" variant="outline" class="text-gray-600 dark:text-gray-300">Batal</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const { data: activeTenancies } = await useFetch('/api/invoices/active-tenancies')

const now = new Date()
const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const defaultDue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-10`

const tenancyOptions = computed(() =>
  (activeTenancies.value || []).map(t => ({
    label: `${t.tenant.fullName} — Kamar ${t.room.roomNumber} (Rp ${Number(t.room.monthlyRate).toLocaleString('id-ID')}/bln)`,
    value: t.id,
  }))
)

const form = reactive({
  tenancyId: '',
  period: defaultPeriod,
  dueDate: defaultDue,
  items: [{ description: 'Sewa Kamar', amount: 0 }],
})

const error = ref('')
const loading = ref(false)

function onTenancyChange() {
  const selected = activeTenancies.value?.find(t => t.id === form.tenancyId)
  if (selected && form.items.length > 0) {
    form.items[0].description = 'Sewa Kamar'
    form.items[0].amount = Number(selected.room.monthlyRate)
  }
}

function addItem() { form.items.push({ description: '', amount: 0 }) }

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
