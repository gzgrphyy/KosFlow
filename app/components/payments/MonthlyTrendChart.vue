<template>
  <UCard class="mb-8 shadow-md" :ui="{ body: { padding: 'px-6 py-5 sm:p-8' } }">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Tren Pemasukan Bulanan</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
        <button
          v-for="opt in monthOptions" :key="opt.value"
          class="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
          :class="months === opt.value
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          @click="emit('update:months', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <USkeleton class="h-[420px] w-full rounded-xl" />
    </div>

    <div v-else-if="!data || data.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-12 h-12 mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Icon name="lucide:trending-up" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Belum ada data pemasukan</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">Belum ada transaksi terverifikasi dalam periode ini.</p>
    </div>

    <div v-else class="relative h-[420px]">
      <Line
        :data="chartData"
        :options="chartOptions"
        :key="chartKey"
      />
    </div>
  </UCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, ChartDataLabels)

const props = defineProps({
  data: { type: Array, default: () => [] },
  months: { type: Number, default: 6 },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:months', 'point-click'])

const chartKey = ref(0)

const monthOptions = [
  { label: '6 Bulan', value: 6 },
  { label: '12 Bulan', value: 12 },
]

const subtitle = computed(() => {
  return `${props.months} bulan terakhir — berdasarkan tanggal transaksi diverifikasi`
})

function formatMonthLabel(monthStr) {
  const [y, m] = monthStr.split('-')
  const date = new Date(+y, +m - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

function formatCurrency(value) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`
  return `Rp ${value}`
}

function buildPointStyles(length) {
  const radius = Array(length).fill(7)
  const hoverRadius = Array(length).fill(9)
  const borderWidth = Array(length).fill(2)
  const borderColor = Array(length).fill('#fff')

  if (length > 0) {
    radius[length - 1] = 10
    hoverRadius[length - 1] = 12
    borderWidth[length - 1] = 3
    borderColor[length - 1] = '#065f46'
  }

  return { radius, hoverRadius, borderWidth, borderColor }
}

const chartData = computed(() => {
  const values = props.data.map((d) => d.net)
  const { radius, hoverRadius, borderWidth, borderColor } = buildPointStyles(values.length)

  return {
    labels: props.data.map((d) => formatMonthLabel(d.month)),
    datasets: [
      {
        label: 'Pemasukan Bersih',
        data: values,
        borderColor: '#10b981',
        backgroundColor: (ctx) => {
          if (!ctx.chart.chartArea) return 'rgba(16, 185, 129, 0.08)'
          const gradient = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom)
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.30)')
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)')
          return gradient
        },
        fill: true,
        tension: 0.35,
        pointRadius: radius,
        pointHoverRadius: hoverRadius,
        pointBackgroundColor: '#10b981',
        pointBorderColor: borderColor,
        pointBorderWidth: borderWidth,
        pointHoverBackgroundColor: '#059669',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        borderWidth: 3.5,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const values = props.data.map((d) => d.net)
  const maxVal = values.length > 0 ? Math.max(...values) : 0
  const lastIdx = values.length - 1

  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const idx = elements[0].index
        const point = props.data[idx]
        if (point) {
          emit('point-click', point.month)
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
        displayColors: false,
        callbacks: {
          title: (items) => {
            if (items.length > 0) return items[0].label
            return ''
          },
          label: (ctx) => {
            const point = props.data[ctx.dataIndex]
            const raw = ctx.raw
            const lines = []
            lines.push(`Pemasukan: Rp ${Number(raw).toLocaleString('id-ID')}`)
            if (point) {
              lines.push(`Transaksi: ${point.transactionCount}`)
            }
            return lines
          },
        },
      },
      datalabels: {
        display: (ctx) => {
          const val = ctx.dataset.data[ctx.dataIndex]
          return val === maxVal || ctx.dataIndex === lastIdx
        },
        color: '#047857',
        font: { weight: 'bold', size: 11 },
        anchor: 'end',
        align: 'end',
        offset: 6,
        formatter: (value) => formatCurrency(value),
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter, sans-serif' },
          maxRotation: 0,
          minRotation: 0,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
          drawBorder: false,
        },
        afterBuildTicks: (axis) => {
          if (axis.max <= 0) {
            axis.ticks = [{ value: 0 }]
            return
          }
          axis.ticks = axis.ticks
            .map((t) => ({ value: Math.round(t.value) }))
            .filter((t, i, arr) => arr.findIndex((x) => x.value === t.value) === i)
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter, sans-serif' },
          padding: 8,
          callback: (value) => {
            if (value === 0) return 'Rp 0'
            if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`
            if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`
            return `Rp ${Number(value).toLocaleString('id-ID')}`
          },
        },
        border: { display: false },
      },
    },
  }
})
</script>
