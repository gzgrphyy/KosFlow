<template>
  <div v-if="loading" class="space-y-3">
    <USkeleton class="h-[200px] w-full rounded-xl" />
  </div>

  <div v-else class="relative h-[220px]">
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const colorMode = useColorMode()

const labelColor = computed(() => colorMode.value === 'dark' ? '#e5e7eb' : '#374151')

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['bar-click'])

const statusConfig = {
  LUNAS:       { label: 'Lunas',       color: '#22c55e', bg: 'rgba(34, 197, 94, 0.85)' },
  SEBAGIAN:    { label: 'Sebagian',    color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.85)' },
  BELUM_LUNAS: { label: 'Belum Bayar', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.85)' },
  TELAT:       { label: 'Telat',       color: '#ef4444', bg: 'rgba(239, 68, 68, 0.85)' },
}

const chartData = computed(() => {
  const labels = props.data.map((d) => statusConfig[d.status]?.label || d.status)
  const counts = props.data.map((d) => d.count)
  const colors = props.data.map((d) => statusConfig[d.status]?.bg || '#6b7280')

  return {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors,
        borderColor: colors.map((c) => c.replace('0.85', '1')),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 28,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_event, elements) => {
    if (elements.length > 0) {
      const idx = elements[0].index
      const item = props.data[idx]
      if (item) {
        emit('bar-click', item.status)
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      callbacks: {
        title: (items) => {
          if (items.length > 0) return items[0].label
          return ''
        },
        label: (ctx) => {
          const item = props.data[ctx.dataIndex]
          if (!item) return ''
          const lines = []
          lines.push(`${item.count} penyewa`)
          lines.push(`Total Rp ${item.total.toLocaleString('id-ID')}`)
          return lines
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.08)',
        drawBorder: false,
      },
      ticks: {
        stepSize: 1,
        color: '#94a3b8',
        font: { size: 11, family: 'Inter, sans-serif' },
      },
      border: { display: false },
    },
    y: {
      grid: { display: false },
      ticks: {
        color: labelColor.value,
        font: { size: 12, weight: '500', family: 'Inter, sans-serif' },
      },
      border: { display: false },
    },
  },
}))
</script>
