export const rupiahFormatter = new Intl.NumberFormat('id-ID')

export function formatRupiah(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (isNaN(num) || num === 0) return ''
  return rupiahFormatter.format(num)
}

export function parseRupiah(value: string): number {
  return Number(value.replace(/\./g, '')) || 0
}

export function useRupiahInput(initialValue: number = 0) {
  const rawValue = ref(initialValue)
  const displayValue = ref(initialValue > 0 ? rupiahFormatter.format(initialValue) : '')

  function onInput(value: string | Event) {
    const str = typeof value === 'string' ? value : (value.target as HTMLInputElement).value
    const digits = str.replace(/\D/g, '')
    const num = Number(digits) || 0
    rawValue.value = num
    displayValue.value = num > 0 ? rupiahFormatter.format(num) : ''
  }

  function setValue(num: number) {
    rawValue.value = num
    displayValue.value = num > 0 ? rupiahFormatter.format(num) : ''
  }

  return reactive({ rawValue, displayValue, onInput, setValue })
}
