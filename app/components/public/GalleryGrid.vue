<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
    <div
      v-for="(image, idx) in images"
      :key="idx"
      class="relative group rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
      :class="idx === 0 ? 'col-span-2 row-span-2' : ''"
      @click="emit('select', idx)"
    >
      <img
        :src="image.url"
        :alt="image.caption || 'Foto galeri'"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      <div v-if="image.caption" class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
        <p class="text-white text-xs font-medium">{{ image.caption }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  images: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])
</script>
