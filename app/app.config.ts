export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
    },
    button: {
      rounded: 'rounded-xl',
      default: { size: 'md' },
    },
    card: {
      rounded: 'rounded-2xl',
      shadow: 'shadow-sm',
      body: { padding: 'p-6 sm:p-8' },
      header: { padding: 'p-6 sm:p-8' },
    },
    input: {
      rounded: 'rounded-xl',
    },
    select: {
      rounded: 'rounded-xl',
    },
    textarea: {
      rounded: 'rounded-xl',
    },
    badge: {
      rounded: 'rounded-full',
    },
    table: {
      rounded: 'rounded-2xl',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      th: {
        base: 'text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        padding: 'px-6 py-4',
      },
      td: {
        padding: 'px-6 py-4',
      },
    },
    skeleton: {
      rounded: 'rounded-xl',
    },
  },
})
