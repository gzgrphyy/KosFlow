<template>
  <div class="inline-flex items-center">
    <UBadge
      v-if="status === 'pending'"
      color="warning"
      variant="subtle"
      size="sm"
    >
      Perlu Dikembalikan
    </UBadge>
    <UBadge
      v-else-if="status === 'partial'"
      color="orange"
      variant="subtle"
      size="sm"
    >
      Sebagian Dikembalikan
    </UBadge>
    <UBadge
      v-else-if="status === 'full'"
      color="success"
      variant="subtle"
      size="sm"
    >
      Sudah Dikembalikan
    </UBadge>
    <span v-else class="text-xs text-gray-400 dark:text-gray-500">—</span>
  </div>
</template>

<script setup>
const props = defineProps({
  pendingAmount: { type: Number, default: 0 },
  refundedAmount: { type: Number, default: 0 },
})

const status = computed(() => {
  if (props.pendingAmount > 0 && props.refundedAmount > 0) return 'partial'
  if (props.pendingAmount > 0 && props.refundedAmount <= 0) return 'pending'
  if (props.pendingAmount <= 0 && props.refundedAmount > 0) return 'full'
  return 'none'
})
</script>
