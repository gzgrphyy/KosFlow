<template>
  <div class="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm hover:border-teal-100 transition-all duration-200">
    <!-- Icon -->
    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :class="iconBg">
      <component :is="iconComponent" class="w-5 h-5" />
    </div>
    <!-- Label -->
    <div>
      <p class="text-sm font-medium text-gray-900">{{ label }}</p>
      <p v-if="description" class="text-xs text-gray-400 mt-0.5">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'wifi' },
})

const iconMap = {
  wifi: {
    bg: 'bg-earth-yellow/20 text-earth-black',
    path: 'M12 18h.01M9.172 15.172a4 4 0 015.656 0M6.343 12.343a8 8 0 0111.314 0M3.515 9.515c4.686-4.687 12.284-4.687 17 0',
  },
  ac: {
    bg: 'bg-earth-gray-100 text-earth-gray-700',
    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  bathroom: {
    bg: 'bg-earth-yellow/20 text-earth-black',
    path: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a3 3 0 100-6 3 3 0 000 6z',
  },
  kitchen: {
    bg: 'bg-earth-gray-100 text-earth-gray-700',
    path: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
  parking: {
    bg: 'bg-earth-gray-100 text-earth-gray-700',
    path: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  },
  security: {
    bg: 'bg-earth-yellow/20 text-earth-black',
    path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  tv: {
    bg: 'bg-earth-gray-100 text-earth-gray-700',
    path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  water: {
    bg: 'bg-earth-yellow/20 text-earth-black',
    path: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
  default: {
    bg: 'bg-earth-gray-100 text-earth-gray-500',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

const iconData = computed(() => iconMap[props.icon] || iconMap.default)
const iconBg = computed(() => iconData.value.bg)

const iconComponent = computed(() => {
  return h('svg', {
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    innerHTML: `<path stroke-linecap="round" stroke-linejoin="round" d="${iconData.value.path}" />`,
  })
})
</script>
