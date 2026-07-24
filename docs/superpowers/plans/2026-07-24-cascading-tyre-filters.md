# Filtros de Pneus em Cadeia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer Marca, Medida, Condição e Preço mostrarem apenas opções compatíveis com os restantes filtros e remover automaticamente seleções incompatíveis.

**Architecture:** Uma query auxiliar carrega uma vez os cinco campos mínimos de todos os produtos ativos. O módulo puro `facetedFilters.js` reconcilia filtros segundo a prioridade Veículo → Marca → Medida → Condição → Preço e calcula cada faceta ignorando apenas a sua própria seleção; `PneusPage` mantém o URL como fonte de verdade e `ProductFilters` apenas apresenta as opções recebidas.

**Tech Stack:** React 19, React Router 7.13, Supabase JS 2.97/PostgREST, Vite/Rolldown, Node.js ES modules.

## Global Constraints

- O dropdown `Veículo` apresenta sempre `Todos`, `Carro` e `Mota`.
- Marca, Medida, Condição e Preço mostram apenas opções compatíveis com os restantes filtros ativos.
- Dentro da mesma faceta os valores combinam por OR; entre facetas combinam por AND.
- Seleções incompatíveis são removidas segundo `Veículo → Marca → Medida → Condição → Preço`.
- A reconciliação usa `setSearchParams(next, { replace: true })`, remove `pagina` e só escreve quando o URL muda.
- Não reconciliar nem apagar parâmetros antes de a query auxiliar terminar com sucesso.
- Uma falha da query auxiliar não bloqueia o catálogo nem apaga filtros do URL.
- A query auxiliar seleciona apenas `vehicle_type, brand, tire_size, condition, price_amount` de produtos ativos.
- Os limites de preço continuam com mínimo exclusivo e máximo inclusivo.
- Não adicionar migração, RPC, dependência, alteração ao admin, PR ou merge.
- O lint não pode introduzir problemas além da baseline aceite de 3 erros e 1 aviso.

---

### Task 1: Criar o domínio puro dos filtros facetados

**Files:**
- Create: `motoval-setubal/src/lib/facetedFilters.js`
- Create: `motoval-setubal/scripts/check-faceted-filters.mjs`

**Interfaces:**
- Consumes: `PRICE_BUCKETS`, `PRODUCT_VEHICLE_TYPES` e `vehicleTypeFilterValue`.
- Produces:
  - `PRODUCT_CONDITIONS: ['Novos', 'Usados']`
  - `reconcileFacetedFilters(products, filters)`
  - `buildFacetOptions(products, filters)`
  - `getFacetedFilterState(products, filters)`
- `filters` tem a forma `{ vehicleType, brands, sizes, conditions, priceBucket }`.
- `getFacetedFilterState` devolve `{ filters, brandOptions, sizeOptions, conditionOptions, priceBucketOptions }`.

- [ ] **Step 1: Criar primeiro o check com dados representativos**

Criar `motoval-setubal/scripts/check-faceted-filters.mjs`:

```js
let failures = 0

function check(label, condition) {
  if (!condition) {
    console.error('FAIL:', label)
    failures++
  }
}

let facets
try {
  facets = await import('../src/lib/facetedFilters.js')
} catch {
  facets = null
}

check('faceted filter module exists', facets !== null)

if (facets) {
  const {
    PRODUCT_CONDITIONS,
    reconcileFacetedFilters,
    buildFacetOptions,
    getFacetedFilterState,
  } = facets

  const products = [
    {
      vehicle_type: 'carro',
      brand: 'Michelin',
      tire_size: '205/55 R17',
      condition: 'Usados',
      price_amount: 25,
    },
    {
      vehicle_type: 'carro',
      brand: 'BRIDGESTONE',
      tire_size: '215/40 R17',
      condition: 'Novos',
      price_amount: 55,
    },
    {
      vehicle_type: 'carro',
      brand: 'Bridgestone',
      tire_size: '225/45 R18',
      condition: 'Usados',
      price_amount: 80,
    },
    {
      vehicle_type: 'mota',
      brand: 'Bridgestone',
      tire_size: '120/70 ZR17',
      condition: 'Novos',
      price_amount: 150,
    },
    {
      vehicle_type: 'mota',
      brand: 'Bridgestone',
      tire_size: '180/55 ZR17',
      condition: 'Novos',
      price_amount: 190,
    },
  ]

  const empty = {
    vehicleType: 'todos',
    brands: [],
    sizes: [],
    conditions: [],
    priceBucket: null,
  }

  check(
    'conditions are ordered Novos then Usados',
    JSON.stringify(PRODUCT_CONDITIONS) === JSON.stringify(['Novos', 'Usados'])
  )

  const moto = getFacetedFilterState(products, { ...empty, vehicleType: 'mota' })
  check('mota exposes only Bridgestone', JSON.stringify(moto.brandOptions) === '["Bridgestone"]')
  check(
    'mota exposes only its two sizes',
    JSON.stringify(moto.sizeOptions) === '["120/70 ZR17","180/55 ZR17"]'
  )
  check('mota exposes only Novos', JSON.stringify(moto.conditionOptions) === '["Novos"]')
  check(
    'mota exposes only more than 100',
    JSON.stringify(moto.priceBucketOptions.map((bucket) => bucket.id)) === '["mais-100"]'
  )

  const car = buildFacetOptions(products, { ...empty, vehicleType: 'carro' })
  check('car excludes motorcycle size', !car.sizeOptions.includes('120/70 ZR17'))
  check('car excludes motorcycle price bucket', !car.priceBucketOptions.some((b) => b.id === 'mais-100'))

  const all = buildFacetOptions(products, empty)
  check('todos includes both vehicle sizes', all.sizeOptions.includes('205/55 R17') && all.sizeOptions.includes('120/70 ZR17'))

  const brandsForMotoSize = buildFacetOptions(products, {
    ...empty,
    sizes: ['120/70 ZR17'],
  })
  check(
    'brand facet respects size while ignoring its own selection',
    JSON.stringify(brandsForMotoSize.brandOptions) === '["Bridgestone"]'
  )

  const sizesForTwoBrands = buildFacetOptions(products, {
    ...empty,
    brands: ['Michelin', 'Bridgestone'],
  })
  check(
    'multiple brands combine with OR',
    sizesForTwoBrands.sizeOptions.includes('205/55 R17') &&
      sizesForTwoBrands.sizeOptions.includes('120/70 ZR17')
  )

  const conditionsForCheapMichelin = buildFacetOptions(products, {
    ...empty,
    brands: ['Michelin'],
    priceBucket: 'ate-30',
  })
  check(
    'condition facet respects brand and price',
    JSON.stringify(conditionsForCheapMichelin.conditionOptions) === '["Usados"]'
  )

  const priceForNewCar = buildFacetOptions(products, {
    ...empty,
    vehicleType: 'carro',
    conditions: ['Novos'],
  })
  check(
    'price facet respects vehicle and condition',
    JSON.stringify(priceForNewCar.priceBucketOptions.map((bucket) => bucket.id)) === '["30-60"]'
  )

  const deduplicated = buildFacetOptions(products, empty)
  check(
    'brands deduplicate case insensitively',
    deduplicated.brandOptions.filter((brand) => brand.toLowerCase() === 'bridgestone').length === 1
  )

  const reconciled = reconcileFacetedFilters(products, {
    vehicleType: 'mota',
    brands: ['Michelin'],
    sizes: ['205/55 R17'],
    conditions: ['Usados'],
    priceBucket: 'ate-30',
  })
  check('vehicle survives reconciliation', reconciled.vehicleType === 'mota')
  check('incompatible brand is removed', reconciled.brands.length === 0)
  check('incompatible size is removed', reconciled.sizes.length === 0)
  check('incompatible condition is removed', reconciled.conditions.length === 0)
  check('incompatible price is removed', reconciled.priceBucket === null)

  const preserved = reconcileFacetedFilters(products, {
    vehicleType: 'mota',
    brands: ['Bridgestone'],
    sizes: ['120/70 ZR17'],
    conditions: ['Novos'],
    priceBucket: 'mais-100',
  })
  check(
    'compatible selections are preserved',
    JSON.stringify(preserved) === JSON.stringify({
      vehicleType: 'mota',
      brands: ['Bridgestone'],
      sizes: ['120/70 ZR17'],
      conditions: ['Novos'],
      priceBucket: 'mais-100',
    })
  )
}

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}

console.log('faceted filter checks passed')
```

- [ ] **Step 2: Executar o check e confirmar RED**

Run:

```bash
cd motoval-setubal
node scripts/check-faceted-filters.mjs
```

Expected: FAIL em `faceted filter module exists`.

- [ ] **Step 3: Implementar o helper puro**

Criar `motoval-setubal/src/lib/facetedFilters.js`:

```js
import { PRICE_BUCKETS } from './priceBuckets.js'
import {
  PRODUCT_VEHICLE_TYPES,
  vehicleTypeFilterValue,
} from './vehicleType.js'

export const PRODUCT_CONDITIONS = ['Novos', 'Usados']

function unique(values) {
  return [...new Set(values)]
}

function sortPt(values) {
  return [...values].sort((a, b) => a.localeCompare(b, 'pt-PT'))
}

function brandKey(value) {
  return value.trim().toLowerCase()
}

function normalizeProducts(products) {
  return products
    .map((product) => {
      const brand = typeof product.brand === 'string' ? product.brand.trim() : ''
      const size = typeof product.tire_size === 'string' ? product.tire_size.trim() : ''
      const condition = PRODUCT_CONDITIONS.includes(product.condition) ? product.condition : null
      const price = Number(product.price_amount)
      return {
        vehicleType: product.vehicle_type,
        brand,
        brandKey: brand ? brandKey(brand) : '',
        size,
        condition,
        price: Number.isFinite(price) ? price : null,
      }
    })
    .filter((product) => PRODUCT_VEHICLE_TYPES.includes(product.vehicleType))
}

function selectedList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function priceMatches(price, bucket) {
  if (price == null || !bucket) return false
  if (bucket.min != null && price <= bucket.min) return false
  if (bucket.max != null && price > bucket.max) return false
  return true
}

function filterRows(rows, filters, excludedFacet = null) {
  const vehicleFilter = vehicleTypeFilterValue(filters.vehicleType)
  const brands = new Set(selectedList(filters.brands).map(brandKey))
  const sizes = new Set(selectedList(filters.sizes))
  const conditions = new Set(selectedList(filters.conditions))
  const bucket = PRICE_BUCKETS.find((item) => item.id === filters.priceBucket)

  return rows.filter((row) => {
    if (vehicleFilter && row.vehicleType !== vehicleFilter) return false
    if (excludedFacet !== 'brands' && brands.size > 0 && !brands.has(row.brandKey)) return false
    if (excludedFacet !== 'sizes' && sizes.size > 0 && !sizes.has(row.size)) return false
    if (
      excludedFacet !== 'conditions' &&
      conditions.size > 0 &&
      !conditions.has(row.condition)
    ) return false
    if (excludedFacet !== 'priceBucket' && bucket && !priceMatches(row.price, bucket)) return false
    return true
  })
}

function canonicalBrands(rows) {
  const map = new Map()
  for (const row of rows) {
    if (row.brand && !map.has(row.brandKey)) map.set(row.brandKey, row.brand)
  }
  return map
}

function keepSelectedBrands(selected, rows) {
  const available = canonicalBrands(rows)
  return unique(
    selectedList(selected)
      .map((brand) => available.get(brandKey(brand)))
      .filter(Boolean)
  )
}

function keepSelectedValues(selected, rows, readValue) {
  const available = new Set(rows.map(readValue).filter(Boolean))
  return unique(selectedList(selected).filter((value) => available.has(value)))
}

export function reconcileFacetedFilters(products, filters) {
  const rows = normalizeProducts(products)
  const next = {
    vehicleType: filters.vehicleType,
    brands: [],
    sizes: [],
    conditions: [],
    priceBucket: null,
  }

  let scoped = filterRows(rows, next)
  next.brands = keepSelectedBrands(filters.brands, scoped)

  scoped = filterRows(rows, next)
  next.sizes = keepSelectedValues(filters.sizes, scoped, (row) => row.size)

  scoped = filterRows(rows, next)
  next.conditions = keepSelectedValues(filters.conditions, scoped, (row) => row.condition)

  scoped = filterRows(rows, next)
  const selectedBucket = PRICE_BUCKETS.find((bucket) => bucket.id === filters.priceBucket)
  if (selectedBucket && scoped.some((row) => priceMatches(row.price, selectedBucket))) {
    next.priceBucket = selectedBucket.id
  }

  return next
}

export function buildFacetOptions(products, filters) {
  const rows = normalizeProducts(products)

  const brandRows = filterRows(rows, filters, 'brands')
  const brandMap = canonicalBrands(brandRows)
  for (const brand of selectedList(filters.brands)) {
    if (!brandMap.has(brandKey(brand))) brandMap.set(brandKey(brand), brand)
  }

  const sizeRows = filterRows(rows, filters, 'sizes')
  const conditionRows = filterRows(rows, filters, 'conditions')
  const priceRows = filterRows(rows, filters, 'priceBucket')

  const sizeOptions = unique([
    ...sizeRows.map((row) => row.size).filter(Boolean),
    ...selectedList(filters.sizes),
  ])
  const conditionSet = new Set([
    ...conditionRows.map((row) => row.condition).filter(Boolean),
    ...selectedList(filters.conditions),
  ])
  const priceIds = new Set(
    PRICE_BUCKETS
      .filter((bucket) => priceRows.some((row) => priceMatches(row.price, bucket)))
      .map((bucket) => bucket.id)
  )
  if (filters.priceBucket) priceIds.add(filters.priceBucket)

  return {
    brandOptions: sortPt(brandMap.values()),
    sizeOptions: sortPt(sizeOptions),
    conditionOptions: PRODUCT_CONDITIONS.filter((condition) => conditionSet.has(condition)),
    priceBucketOptions: PRICE_BUCKETS.filter((bucket) => priceIds.has(bucket.id)),
  }
}

export function getFacetedFilterState(products, filters) {
  const reconciledFilters = reconcileFacetedFilters(products, filters)
  return {
    filters: reconciledFilters,
    ...buildFacetOptions(products, reconciledFilters),
  }
}
```

- [ ] **Step 4: Executar o check e confirmar GREEN**

Run:

```bash
node scripts/check-faceted-filters.mjs
```

Expected:

```text
faceted filter checks passed
```

- [ ] **Step 5: Executar regressões do domínio**

Run:

```bash
node scripts/check-price.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-vehicle-type.mjs
```

Expected: os três checks terminam com exit code 0.

- [ ] **Step 6: Fazer commit**

```bash
git add motoval-setubal/src/lib/facetedFilters.js motoval-setubal/scripts/check-faceted-filters.mjs
git commit -m "feat(pneus): calcular opções de filtros em cadeia"
```

---

### Task 2: Integrar opções facetadas no URL e na interface

**Files:**
- Modify: `motoval-setubal/scripts/check-faceted-filters.mjs`
- Modify: `motoval-setubal/src/pages/PneusPage.jsx`
- Modify: `motoval-setubal/src/components/products/ProductFilters.jsx`

**Interfaces:**
- Consumes: `getFacetedFilterState(products, filters)` da Task 1.
- Produces: `ProductFilters` com props `conditionOptions` e `priceBucketOptions`, além das props existentes.
- Mantém `searchParams` como fonte de verdade e a query paginada existente.

- [ ] **Step 1: Acrescentar checks de integração antes de alterar produção**

No início de `motoval-setubal/scripts/check-faceted-filters.mjs`, adicionar:

```js
import { readFileSync } from 'node:fs'
```

Antes do bloco final de failures, adicionar:

```js
const read = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

const pneusPage = read('../src/pages/PneusPage.jsx')
const productFilters = read('../src/components/products/ProductFilters.jsx')

check(
  'page selects only fields required for facets',
  pneusPage.includes(
    ".select('vehicle_type, brand, tire_size, condition, price_amount')"
  )
)
check('page tracks successful facet loading', pneusPage.includes('facetsReady'))
check('page derives cascading state', pneusPage.includes('getFacetedFilterState('))
check('page does not reconcile before facets are ready', pneusPage.includes('if (!facetsReady) return'))
check('page reconciliation removes pagination', pneusPage.includes("next.delete('pagina')"))
check(
  'page reconciliation replaces current URL',
  pneusPage.includes('setSearchParams(next, { replace: true })')
)
check(
  'page passes all dynamic option lists',
  pneusPage.includes('conditionOptions={facetState.conditionOptions}') &&
    pneusPage.includes('priceBucketOptions={facetState.priceBucketOptions}')
)
check(
  'failed facet load exposes only selected conditions',
  pneusPage.includes('conditionOptions: selectedConditions')
)
check(
  'failed facet load exposes only selected price bucket',
  pneusPage.includes(
    'PRICE_BUCKETS.filter((bucket) => bucket.id === selectedPriceBucket)'
  )
)
check(
  'filters consume dynamic conditions',
  productFilters.includes('conditionOptions.map') &&
    !productFilters.includes('const CONDITIONS')
)
check(
  'filters consume dynamic prices',
  productFilters.includes('priceBucketOptions.map') &&
    !productFilters.includes('PRICE_BUCKETS.map')
)
check(
  'vehicle dropdown remains unconditional',
  productFilters.indexOf('label="Veículo"') < productFilters.indexOf('brandOptions.length > 0')
)
```

- [ ] **Step 2: Executar o check e confirmar RED**

Run:

```bash
node scripts/check-faceted-filters.mjs
```

Expected: FAIL nos novos contratos de integração.

- [ ] **Step 3: Substituir o carregamento estático de opções em PneusPage**

Em `PneusPage.jsx`, adicionar o import:

```js
import { getFacetedFilterState } from '../lib/facetedFilters'
```

Substituir:

```js
const [brandOptions, setBrandOptions] = useState([])
const [sizeOptions, setSizeOptions] = useState([])
```

por:

```js
const [facetProducts, setFacetProducts] = useState([])
const [facetsReady, setFacetsReady] = useState(false)
```

Depois de calcular os filtros selecionados, adicionar:

```js
const selectedFilterState = useMemo(() => ({
  vehicleType: selectedVehicleType,
  brands: selectedBrands,
  sizes: selectedSizes,
  conditions: selectedConditions,
  priceBucket: selectedPriceBucket,
}), [
  selectedVehicleType,
  selectedBrands,
  selectedSizes,
  selectedConditions,
  selectedPriceBucket,
])

const facetState = useMemo(() => {
  if (!facetsReady) {
    return {
      filters: selectedFilterState,
      brandOptions: selectedBrands,
      sizeOptions: selectedSizes,
      conditionOptions: selectedConditions,
      priceBucketOptions: PRICE_BUCKETS.filter(
        (bucket) => bucket.id === selectedPriceBucket
      ),
    }
  }
  return getFacetedFilterState(facetProducts, selectedFilterState)
}, [
  facetsReady,
  facetProducts,
  selectedFilterState,
  selectedBrands,
  selectedSizes,
])
```

Substituir integralmente o efeito `fetchOptions` por:

```js
useEffect(() => {
  if (!supabase) return

  let cancelled = false

  async function fetchFacetProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('vehicle_type, brand, tire_size, condition, price_amount')
      .eq('is_active', true)

    if (cancelled) return
    if (error) {
      console.error('Não foi possível carregar as opções dos filtros.', error)
      return
    }

    setFacetProducts(data || [])
    setFacetsReady(true)
  }

  fetchFacetProducts()
  return () => { cancelled = true }
}, [])
```

- [ ] **Step 4: Reconciliar o URL apenas depois do carregamento**

Depois do efeito da query auxiliar, adicionar:

```js
useEffect(() => {
  if (!facetsReady) return

  const reconciled = facetState.filters
  const sameBrands = reconciled.brands.join(',') === selectedBrands.join(',')
  const sameSizes = reconciled.sizes.join(',') === selectedSizes.join(',')
  const sameConditions = reconciled.conditions.join(',') === selectedConditions.join(',')
  const samePrice = reconciled.priceBucket === selectedPriceBucket

  if (sameBrands && sameSizes && sameConditions && samePrice) return

  const next = new URLSearchParams(searchParams)
  const setList = (key, values) => {
    if (values.length > 0) next.set(key, values.join(','))
    else next.delete(key)
  }

  setList('marca', reconciled.brands)
  setList('medida', reconciled.sizes)
  setList('condicao', reconciled.conditions)
  if (reconciled.priceBucket) next.set('preco', reconciled.priceBucket)
  else next.delete('preco')
  next.delete('pagina')
  setSearchParams(next, { replace: true })
}, [
  facetsReady,
  facetState.filters,
  searchParams,
  setSearchParams,
  selectedBrands,
  selectedSizes,
  selectedConditions,
  selectedPriceBucket,
])
```

- [ ] **Step 5: Passar as opções calculadas a ProductFilters**

Substituir as props de opções por:

```jsx
<ProductFilters
  brandOptions={facetState.brandOptions}
  sizeOptions={facetState.sizeOptions}
  conditionOptions={facetState.conditionOptions}
  priceBucketOptions={facetState.priceBucketOptions}
  selectedBrands={selectedBrands}
  selectedSizes={selectedSizes}
  selectedConditions={selectedConditions}
  selectedPriceBucket={selectedPriceBucket}
  selectedVehicleType={selectedVehicleType}
  onToggleBrand={toggleBrand}
  onToggleSize={toggleSize}
  onToggleCondition={toggleCondition}
  onSelectPriceBucket={selectPriceBucket}
  onSelectVehicleType={selectVehicleType}
  onClear={clearFilters}
/>
```

- [ ] **Step 6: Fazer ProductFilters renderizar as opções recebidas**

Em `ProductFilters.jsx`, remover:

```js
import { PRICE_BUCKETS } from '../../lib/priceBuckets'
const CONDITIONS = ['Novos', 'Usados']
```

Adicionar às props:

```js
conditionOptions,
priceBucketOptions,
```

Substituir os dropdowns Condição e Preço por:

```jsx
{conditionOptions.length > 0 && (
  <FilterDropdown
    label="Condição"
    count={selectedConditions.length}
    isOpen={openFilter === 'condicao'}
    onToggle={() => toggleOpenFilter('condicao')}
    onClose={() => setOpenFilter(null)}
  >
    {conditionOptions.map((condition) => (
      <OptionRow
        key={condition}
        label={condition}
        checked={selectedConditions.includes(condition)}
        onClick={() => onToggleCondition(condition)}
      />
    ))}
  </FilterDropdown>
)}

{priceBucketOptions.length > 0 && (
  <FilterDropdown
    label="Preço"
    count={selectedPriceBucket ? 1 : 0}
    isOpen={openFilter === 'preco'}
    onToggle={() => toggleOpenFilter('preco')}
    onClose={() => setOpenFilter(null)}
  >
    {priceBucketOptions.map((bucket) => (
      <OptionRow
        key={bucket.id}
        label={bucket.label}
        checked={selectedPriceBucket === bucket.id}
        onClick={() => onSelectPriceBucket(bucket.id)}
        shape="radio"
      />
    ))}
  </FilterDropdown>
)}
```

- [ ] **Step 7: Executar os checks focados**

Run:

```bash
node scripts/check-faceted-filters.mjs
node scripts/check-price.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-vehicle-type.mjs
node scripts/check-pneus-route.mjs
```

Expected: os cinco checks terminam com exit code 0.

- [ ] **Step 8: Confirmar build e baseline de lint**

Run:

```bash
npm run build
npm run lint
git diff --check
```

Expected:

- build com exit code 0;
- lint com exatamente os 3 erros e 1 aviso preexistentes;
- diff-check sem output.

- [ ] **Step 9: Fazer commit**

```bash
git add motoval-setubal/scripts/check-faceted-filters.mjs motoval-setubal/src/pages/PneusPage.jsx motoval-setubal/src/components/products/ProductFilters.jsx
git commit -m "feat(pneus): encadear opções dos filtros"
```

---

## Controller Gate

- [ ] Executar:

```bash
cd motoval-setubal
npm run lint
node scripts/check-price.mjs
node scripts/check-slug.mjs
node scripts/check-seo.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-pneus-route.mjs
node scripts/check-supabase-config.mjs
node scripts/check-vehicle-type.mjs
node scripts/check-faceted-filters.mjs
npm run build
git diff --check main...HEAD
```

- [ ] Confirmar que os oito checks Node e o build passam e que o lint não excede a baseline.
- [ ] Fazer QA manual, se o browser integrado estiver disponível:
  1. selecionar Mota e confirmar Bridgestone, duas medidas, Novos e Mais de 100€;
  2. trocar para Carro e confirmar limpeza automática;
  3. combinar as quatro facetas e confirmar opções compatíveis;
  4. abrir detalhe e regressar;
  5. repetir em mobile e desktop.
- [ ] Gerar um pacote desde `git merge-base main HEAD` até `HEAD` e enviar a um reviewer global.
- [ ] Corrigir e rever qualquer finding Critical ou Important; registar Minors.
- [ ] Manter o branch sem PR e sem merge.
