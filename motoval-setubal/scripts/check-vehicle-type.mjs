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

const read = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

const pneusPage = read('../src/pages/PneusPage.jsx')
const productFilters = read('../src/components/products/ProductFilters.jsx')

check('page reads veiculo from URL', pneusPage.includes("searchParams.get('veiculo')"))
check('page normalizes vehicle param', pneusPage.includes('normalizeVehicleParam(vehicleParam)'))
check('page applies vehicle query filter', pneusPage.includes('applyVehicleTypeFilter(query, selectedVehicleType)'))
check('page vehicle filter participates in active state', pneusPage.includes('selectedVehicleFilter'))
check('clear filters stores todos', pneusPage.includes("new URLSearchParams({ veiculo: 'todos' })"))
check('page passes vehicle props', pneusPage.includes('selectedVehicleType={selectedVehicleType}'))
check('filters expose Veículo dropdown', productFilters.includes('label="Veículo"'))
check('filters render all vehicle options', productFilters.includes('VEHICLE_FILTER_OPTIONS.map'))
check('filters use radio behavior', productFilters.includes('shape="radio"'))

let prompt = ''
try {
  prompt = read('../src/components/products/VehicleTypePrompt.jsx')
} catch {
  prompt = ''
}

check('vehicle prompt component exists', prompt.length > 0)
check('prompt is an accessible modal', prompt.includes('role="dialog"') && prompt.includes('aria-modal="true"'))
check('prompt uses blurred backdrop', prompt.includes('backdrop-blur'))
check('prompt offers carro', prompt.includes("value: 'carro'") && prompt.includes('Pneus para carro'))
check('prompt offers mota', prompt.includes("value: 'mota'") && prompt.includes('Pneus para mota'))
check('prompt selection calls handler', prompt.includes('onClick={() => onSelect(value)}'))
check('prompt locks page scroll', prompt.includes("document.body.style.overflow = 'hidden'"))
check('prompt traps Tab focus', prompt.includes("event.key !== 'Tab'"))
check('page opens prompt for invalid vehicle', pneusPage.includes('selectedVehicleType === null'))

const productCard = read('../src/components/products/ProductCard.jsx')
const productDetail = read('../src/pages/ProductDetailPage.jsx')

check('product card reads current query', productCard.includes('useLocation'))
check(
  'product card preserves query in detail link',
  productCard.includes('pathname: `/pneus/${productSlug(product)}`') &&
    productCard.includes('search,')
)
check('product detail reads current query', productDetail.includes('useLocation'))
check(
  'detail creates filtered listing destination',
  productDetail.includes("pathname: '/pneus'") && productDetail.includes('search,')
)
check('detail links use listing destination', productDetail.match(/to=\{listingDestination\}/g)?.length >= 2)

const admin = read('../src/pages/AdminPage.jsx')

check('admin imports vehicle domain', admin.includes('PRODUCT_VEHICLE_TYPES'))
check("new admin form has no default vehicle", admin.includes("vehicle_type: ''"))
check('edit form loads vehicle type', admin.includes("vehicle_type: product.vehicle_type || ''"))
check('admin requires a vehicle type', admin.includes('PRODUCT_VEHICLE_TYPES.includes(form.vehicle_type)'))
check('admin renders vehicle select label', admin.includes('Tipo de veículo *'))
check('admin renders vehicle placeholder', admin.includes('Seleciona o tipo'))
check('admin payload includes form vehicle type', admin.includes('...form'))
check('admin list renders vehicle badge', admin.includes('vehicleTypeLabel(product.vehicle_type)'))

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('vehicle type checks passed')
