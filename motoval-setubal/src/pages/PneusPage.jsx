import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import { itemListSchema } from '../lib/seo/schema'
import { site } from '../data/site'
import { PRICE_BUCKETS } from '../lib/priceBuckets'
import { escapeOrValue } from '../lib/postgrestFilter'
import {
  applyVehicleTypeFilter,
  normalizeVehicleParam,
  toggleVehicleType,
  vehicleTypeFilterValue,
} from '../lib/vehicleType'
import AnimatedSection from '../components/ui/AnimatedSection'
import SectionTitle from '../components/ui/SectionTitle'
import Pagination from '../components/ui/Pagination'
import ProductCard from '../components/products/ProductCard'
import ProductFilters from '../components/products/ProductFilters'
import VehicleTypePrompt from '../components/products/VehicleTypePrompt'

const PAGE_SIZE = 9

function parseListParam(value) {
  return value.split(',').filter(Boolean)
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#141414] border border-[#2D2D2D] rounded-xl overflow-hidden animate-pulse">
      <div className="w-full h-52 bg-[#1A1A1A]" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-[#2D2D2D] rounded w-1/3" />
        <div className="h-4 bg-[#2D2D2D] rounded w-3/4" />
        <div className="h-3 bg-[#2D2D2D] rounded w-1/2" />
        <div className="h-10 bg-[#2D2D2D] rounded mt-4" />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PneusPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [totalCount, setTotalCount] = useState(0)
  const [brandOptions, setBrandOptions] = useState([])
  const [sizeOptions, setSizeOptions] = useState([])

  const parsedPage = Math.floor(Number(searchParams.get('pagina')))
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const marcaParam = searchParams.get('marca') ?? ''
  const medidaParam = searchParams.get('medida') ?? ''
  const condicaoParam = searchParams.get('condicao') ?? ''
  const precoParam = searchParams.get('preco')
  const vehicleParam = searchParams.get('veiculo')
  const selectedPriceBucket = PRICE_BUCKETS.some((b) => b.id === precoParam) ? precoParam : null
  const selectedVehicleType = normalizeVehicleParam(vehicleParam)
  const selectedVehicleFilter = vehicleTypeFilterValue(selectedVehicleType)

  // Memoized on the underlying URL param string so array identity stays
  // stable across unrelated re-renders (e.g. brandOptions/sizeOptions
  // loading) — otherwise the fetch effect below would refetch every render.
  const selectedBrands = useMemo(() => parseListParam(marcaParam), [marcaParam])
  const selectedSizes = useMemo(() => parseListParam(medidaParam), [medidaParam])
  const selectedConditions = useMemo(() => parseListParam(condicaoParam), [condicaoParam])
  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedSizes.length > 0 ||
    selectedConditions.length > 0 ||
    !!selectedPriceBucket ||
    !!selectedVehicleFilter

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Filter options reflect ALL active products, independent of the current
  // selection, so choosing a brand never hides other brands from the list.
  useEffect(() => {
    if (!supabase) return

    async function fetchOptions() {
      const { data } = await supabase
        .from('products')
        .select('brand, tire_size')
        .eq('is_active', true)
      if (!data) return

      const brandMap = new Map()
      const sizeSet = new Set()
      for (const row of data) {
        if (row.brand) {
          const key = row.brand.trim().toLowerCase()
          if (!brandMap.has(key)) brandMap.set(key, row.brand.trim())
        }
        if (row.tire_size) sizeSet.add(row.tire_size.trim())
      }
      setBrandOptions([...brandMap.values()].sort((a, b) => a.localeCompare(b, 'pt-PT')))
      setSizeOptions([...sizeSet].sort((a, b) => a.localeCompare(b, 'pt-PT')))
    }
    fetchOptions()
  }, [])

  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true)
      query = applyVehicleTypeFilter(query, selectedVehicleType)

      if (selectedBrands.length > 0) {
        // ilike without wildcards is a case-insensitive exact match.
        query = query.or(selectedBrands.map((b) => `brand.ilike.${escapeOrValue(b)}`).join(','))
      }
      if (selectedSizes.length > 0) {
        query = query.in('tire_size', selectedSizes)
      }
      if (selectedConditions.length > 0) {
        query = query.in('condition', selectedConditions)
      }
      const bucket = PRICE_BUCKETS.find((b) => b.id === selectedPriceBucket)
      if (bucket) {
        if (bucket.min != null) query = query.gt('price_amount', bucket.min)
        if (bucket.max != null) query = query.lte('price_amount', bucket.max)
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (cancelled) return
      if (!error) {
        setProducts(data || [])
        setTotalCount(count || 0)
      }
      setLoading(false)
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [currentPage, selectedBrands, selectedSizes, selectedConditions, selectedPriceBucket, selectedVehicleType])

  function updateFilters(patch, { resetPage = true } = {}) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      const isEmpty = value == null || (Array.isArray(value) && value.length === 0)
      if (isEmpty) next.delete(key)
      else next.set(key, Array.isArray(value) ? value.join(',') : String(value))
    }
    if (resetPage) next.delete('pagina')
    setSearchParams(next, { replace: true })
  }

  function toggleListFilter(key, current, value) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    updateFilters({ [key]: next })
  }

  const toggleBrand = (brand) => toggleListFilter('marca', selectedBrands, brand)
  const toggleSize = (size) => toggleListFilter('medida', selectedSizes, size)
  const toggleCondition = (condition) => toggleListFilter('condicao', selectedConditions, condition)

  function selectPriceBucket(bucketId) {
    updateFilters({ preco: selectedPriceBucket === bucketId ? null : bucketId })
  }

  function selectVehicleType(vehicleType) {
    const next = toggleVehicleType(selectedVehicleType, vehicleType)
    updateFilters({ veiculo: next })
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams({ veiculo: 'todos' }), { replace: true })
  }

  function handlePageChange(page) {
    updateFilters({ pagina: page > 1 ? String(page) : null }, { resetPage: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageTitle = !loading && totalCount > 0
    ? currentPage > 1
      ? `Pneus Novos e Usados — Página ${currentPage} | Motoval Setúbal`
      : `${totalCount} Pneus Novos e Usados | Motoval Setúbal`
    : 'Pneus Novos e Usados em Palmela | Motoval Setúbal'

  const pageDescription = !loading && products.length > 0
    ? `Pneus novos e usados a preços acessíveis em Palmela. ${products.slice(0, 3).map(p => p.title).join(', ')} e mais. Contacta-nos para mais informações.`
    : 'Pneus novos e usados a preços acessíveis para carros e motos em Palmela. Stock limitado e atualizado regularmente. Ligue 934 803 632.'

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/pneus"
        jsonLd={!loading && products.length > 0 ? itemListSchema(products, site) : undefined}
        noindex={hasActiveFilters}
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
        <AnimatedSection animation="fadeUp" className="pt-12 pb-10">
          <SectionTitle
            title="Pneus Novos e Usados"
            subtitle="Pneus a preços acessíveis. Stock limitado, contacta-nos para mais informações."
          />
        </AnimatedSection>

        <ProductFilters
          brandOptions={brandOptions}
          sizeOptions={sizeOptions}
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 && hasActiveFilters ? (
          <AnimatedSection animation="fadeUp">
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-white text-xl font-semibold mb-2">Nenhum artigo encontrado</h2>
              <p className="text-[#9CA3AF] text-sm max-w-sm mx-auto mb-6">
                Não há artigos que correspondam aos filtros selecionados.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </AnimatedSection>
        ) : products.length === 0 ? (
          <AnimatedSection animation="fadeUp">
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-white text-xl font-semibold mb-2">Brevemente novos pneus disponíveis</h2>
              <p className="text-[#9CA3AF] text-sm max-w-sm mx-auto">
                De momento não temos stock de pneus. Consulta-nos sobre pneus novos ou volta mais tarde.
              </p>
              <a
                href="https://wa.me/351934803632"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Falar connosco
              </a>
            </div>
          </AnimatedSection>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <AnimatedSection key={product.id} animation="fadeUp" delay={i * 80}>
                  <ProductCard product={product} />
                </AnimatedSection>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
      {selectedVehicleType === null && (
        <VehicleTypePrompt onSelect={selectVehicleType} />
      )}
    </main>
  )
}
