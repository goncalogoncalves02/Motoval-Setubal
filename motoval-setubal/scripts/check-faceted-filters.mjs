import { readFileSync } from 'node:fs'

let failures = 0

function check(label, condition) {
  if (!condition) {
    console.error('FAIL:', label)
    failures++
  }
}

function ids(options) {
  return options.map((option) => option.id)
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

  const cascadeProducts = [
    {
      vehicle_type: 'carro',
      brand: 'Michelin',
      tire_size: 'A medida',
      condition: 'Novos',
      price_amount: 30,
    },
    {
      vehicle_type: 'carro',
      brand: 'Michelin',
      tire_size: 'B medida',
      condition: 'Usados',
      price_amount: 60,
    },
    {
      vehicle_type: 'carro',
      brand: 'Michelin',
      tire_size: 'C medida',
      condition: 'Novos',
      price_amount: 100,
    },
    {
      vehicle_type: 'carro',
      brand: 'Michelin',
      tire_size: 'D medida',
      condition: 'Novos',
      price_amount: 101,
    },
    {
      vehicle_type: 'carro',
      brand: 'Bridgestone',
      tire_size: 'E medida',
      condition: 'Novos',
      price_amount: 45,
    },
    {
      vehicle_type: 'mota',
      brand: 'Michelin',
      tire_size: 'F medida',
      condition: 'Novos',
      price_amount: 45,
    },
  ]

  const measureAcrossFacets = buildFacetOptions(cascadeProducts, {
    ...empty,
    vehicleType: 'carro',
    brands: ['Michelin'],
    conditions: ['Novos'],
    priceBucket: '60-100',
  })
  check(
    'measure respects vehicle, brand, condition, and price together',
    JSON.stringify(measureAcrossFacets.sizeOptions) === '["C medida"]'
  )

  const brandsForTwoMeasures = buildFacetOptions(cascadeProducts, {
    ...empty,
    sizes: ['A medida', 'E medida'],
  })
  check(
    'multiple measures combine with OR',
    brandsForTwoMeasures.brandOptions.includes('Michelin') &&
      brandsForTwoMeasures.brandOptions.includes('Bridgestone')
  )

  const measuresForTwoConditions = buildFacetOptions(cascadeProducts, {
    ...empty,
    vehicleType: 'carro',
    brands: ['Michelin'],
    conditions: ['Novos', 'Usados'],
  })
  check(
    'multiple conditions combine with OR',
    JSON.stringify(measuresForTwoConditions.sizeOptions) ===
      '["A medida","B medida","C medida","D medida"]'
  )

  const priceAcrossFacets = buildFacetOptions(cascadeProducts, {
    ...empty,
    vehicleType: 'carro',
    brands: ['Michelin'],
    sizes: ['B medida'],
    conditions: ['Usados'],
  })
  check(
    'different facets combine with AND',
    JSON.stringify(ids(priceAcrossFacets.priceBucketOptions)) === '["30-60"]'
  )

  const boundaryCases = [
    [30, 'ate-30'],
    [60, '30-60'],
    [100, '60-100'],
    [101, 'mais-100'],
  ]
  for (const [price, expectedBucket] of boundaryCases) {
    const boundaryOptions = buildFacetOptions(
      [{
        vehicle_type: 'carro',
        brand: 'Boundary',
        tire_size: `${price}`,
        condition: 'Novos',
        price_amount: price,
      }],
      empty
    )
    check(
      `price ${price} belongs only to ${expectedBucket}`,
      JSON.stringify(ids(boundaryOptions.priceBucketOptions)) ===
        JSON.stringify([expectedBucket])
    )
  }

  for (const [label, price] of [
    ['null', null],
    ['undefined', undefined],
    ['empty string', ''],
  ]) {
    const invalidPriceOptions = buildFacetOptions(
      [{
        vehicle_type: 'carro',
        brand: 'No price',
        tire_size: label,
        condition: 'Novos',
        price_amount: price,
      }],
      empty
    )
    check(
      `${label} price does not create a price bucket`,
      invalidPriceOptions.priceBucketOptions.length === 0
    )
  }

  const divergentBrandState = getFacetedFilterState(
    [
      {
        vehicle_type: 'carro',
        brand: 'BRIDGESTONE',
        tire_size: 'Primeira medida',
        condition: 'Novos',
        price_amount: 55,
      },
      {
        vehicle_type: 'carro',
        brand: 'Bridgestone',
        tire_size: 'Medida selecionada',
        condition: 'Novos',
        price_amount: 55,
      },
    ],
    {
      ...empty,
      vehicleType: 'carro',
      brands: ['BRIDGESTONE'],
      sizes: ['Medida selecionada'],
    }
  )
  check(
    'reconciled brand spelling is exactly present in displayed options',
    divergentBrandState.brandOptions.includes(divergentBrandState.filters.brands[0])
  )
}

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
check(
  'facet load error returns before marking facets ready',
  /if \(error\) \{[\s\S]*?return\s*\n\s*\}[\s\S]*?setFacetProducts\(data \|\| \[\]\)[\s\S]*?setFacetsReady\(true\)/
    .test(pneusPage)
)
check(
  'facets-ready guard precedes reconciliation URL write',
  /useEffect\(\(\) => \{\s*if \(!facetsReady\) return[\s\S]*?setSearchParams\(next, \{ replace: true \}\)/
    .test(pneusPage)
)
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

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}

console.log('faceted filter checks passed')
