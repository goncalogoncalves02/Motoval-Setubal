import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import { itemListSchema } from '../lib/seo/schema'
import { site } from '../data/site'
import AnimatedSection from '../components/ui/AnimatedSection'
import SectionTitle from '../components/ui/SectionTitle'
import Pagination from '../components/ui/Pagination'
import ProductCard from '../components/products/ProductCard'

const PAGE_SIZE = 9

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

export default function OfertasPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  useEffect(() => {
    async function fetchProducts() {
      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (!error) {
        setProducts(data || [])
        setTotalCount(count || 0)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [currentPage])

  function handlePageChange(page) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageTitle = !loading && totalCount > 0
    ? currentPage > 1
      ? `Pneus em Oferta — Página ${currentPage} | Motoval Setúbal`
      : `${totalCount} Pneus em Oferta | Motoval Setúbal`
    : 'Ofertas Especiais de Pneus | Motoval Setúbal'

  const pageDescription = !loading && products.length > 0
    ? `Pneus usados a preços acessíveis em Palmela. ${products.slice(0, 3).map(p => p.title).join(', ')} e mais. Contacta-nos para mais informações.`
    : 'Pneus usados a preços acessíveis para carros e motos em Palmela. Stock limitado e atualizado regularmente. Ligue 934 803 632.'

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/ofertas"
        jsonLd={!loading && products.length > 0 ? itemListSchema(products, site) : undefined}
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
        <AnimatedSection animation="fadeUp" className="pt-12 pb-10">
          <SectionTitle
            title="Ofertas Especiais"
            subtitle="Pneus a preços acessíveis. Stock limitado, contacta-nos para mais informações."
          />
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <AnimatedSection animation="fadeUp">
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-white text-xl font-semibold mb-2">Brevemente novas ofertas disponíveis</h2>
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
    </main>
  )
}
