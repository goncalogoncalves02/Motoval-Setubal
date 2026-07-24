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
