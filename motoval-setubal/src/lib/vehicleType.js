const VEHICLE_LABELS = Object.freeze({
  todos: 'Todos',
  carro: 'Carro',
  mota: 'Mota',
})

export const PRODUCT_VEHICLE_TYPES = Object.freeze(['carro', 'mota'])

export const VEHICLE_FILTER_OPTIONS = Object.freeze(
  ['todos', ...PRODUCT_VEHICLE_TYPES].map((value) =>
    Object.freeze({ value, label: VEHICLE_LABELS[value] })
  )
)

export function normalizeVehicleParam(value) {
  return Object.hasOwn(VEHICLE_LABELS, value) ? value : null
}

export function vehicleTypeLabel(value) {
  return VEHICLE_LABELS[value] || ''
}

export function vehicleTypeFilterValue(value) {
  return PRODUCT_VEHICLE_TYPES.includes(value) ? value : null
}

export function toggleVehicleType(current, next) {
  const normalized = normalizeVehicleParam(next)
  if (!normalized || normalized === 'todos' || current === normalized) return 'todos'
  return normalized
}

export function applyVehicleTypeFilter(query, value) {
  const filterValue = vehicleTypeFilterValue(value)
  return filterValue ? query.eq('vehicle_type', filterValue) : query
}
