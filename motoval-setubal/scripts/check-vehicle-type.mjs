import { readFileSync } from 'node:fs'

let failures = 0
function check(label, condition) {
  if (!condition) {
    console.error('FAIL:', label)
    failures++
  }
}

let vehicleModule
try {
  vehicleModule = await import('../src/lib/vehicleType.js')
} catch {
  vehicleModule = null
}

check('vehicle type module exists', vehicleModule !== null)

if (vehicleModule) {
  const {
    PRODUCT_VEHICLE_TYPES,
    VEHICLE_FILTER_OPTIONS,
    normalizeVehicleParam,
    vehicleTypeLabel,
    vehicleTypeFilterValue,
    toggleVehicleType,
    applyVehicleTypeFilter,
  } = vehicleModule

  check(
    'database vehicle types are exact',
    JSON.stringify(PRODUCT_VEHICLE_TYPES) === JSON.stringify(['carro', 'mota'])
  )
  check(
    'filter options are ordered Todos, Carro, Mota',
    JSON.stringify(VEHICLE_FILTER_OPTIONS) === JSON.stringify([
      { value: 'todos', label: 'Todos' },
      { value: 'carro', label: 'Carro' },
      { value: 'mota', label: 'Mota' },
    ])
  )
  check('normalizes carro', normalizeVehicleParam('carro') === 'carro')
  check('normalizes mota', normalizeVehicleParam('mota') === 'mota')
  check('normalizes todos', normalizeVehicleParam('todos') === 'todos')
  check('rejects missing vehicle', normalizeVehicleParam(null) === null)
  check('rejects invalid vehicle', normalizeVehicleParam('camiao') === null)
  check('labels database values', vehicleTypeLabel('mota') === 'Mota')
  check('todos has no database filter', vehicleTypeFilterValue('todos') === null)
  check('carro has database filter', vehicleTypeFilterValue('carro') === 'carro')
  check('active selection toggles to todos', toggleVehicleType('carro', 'carro') === 'todos')
  check('selection switches vehicle', toggleVehicleType('carro', 'mota') === 'mota')

  const calls = []
  const query = {
    eq(column, value) {
      calls.push([column, value])
      return this
    },
  }
  check('filtered query identity is preserved', applyVehicleTypeFilter(query, 'mota') === query)
  check(
    'mota adds exact PostgREST filter',
    JSON.stringify(calls) === JSON.stringify([['vehicle_type', 'mota']])
  )
  calls.length = 0
  check('todos preserves query identity', applyVehicleTypeFilter(query, 'todos') === query)
  check('todos adds no PostgREST filter', calls.length === 0)
}

let migration = ''
try {
  migration = readFileSync(
    new URL('../supabase/migrations/20260723000100_add_vehicle_type_to_products.sql', import.meta.url),
    'utf8'
  )
} catch {
  migration = ''
}

check('migration adds required vehicle_type', /add column vehicle_type text not null default 'carro'/i.test(migration))
check('migration names the check constraint', migration.includes('products_vehicle_type_check'))
check(
  'migration restricts database values',
  /check\s*\(\s*vehicle_type\s+in\s*\(\s*'carro'\s*,\s*'mota'\s*\)\s*\)/i.test(migration)
)
check('migration backfills Battlax 180 as mota', migration.includes('Bridgestone Battlax T33 180/55 ZR17'))
check('migration backfills Battlax 120 as mota', migration.includes('Bridgestone Battlax T33 120/70 ZR17'))

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('vehicle type checks passed')
