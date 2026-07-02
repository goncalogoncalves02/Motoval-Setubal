export function formatPrice(amount) {
  if (amount == null) return ''
  const formatted = amount.toLocaleString('pt-PT', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} €`
}
