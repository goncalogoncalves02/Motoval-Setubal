import { useEffect, useState } from 'react'
import { MessageCircle, Tag, Ruler, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AnimatedSection from '../components/ui/AnimatedSection'
import SectionTitle from '../components/ui/SectionTitle'

function ProductImageGallery({ images, title }) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-52 bg-[#1A1A1A] flex items-center justify-center rounded-t-xl">
        <span className="text-[#4A4A4A] text-sm">Sem imagem</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-52 rounded-t-xl overflow-hidden bg-[#0A0A0A]">
      <img
        src={images[current]}
        alt={`${title} - foto ${current + 1}`}
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setCurrent((c) => (c - 1 + images.length) % images.length) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setCurrent((c) => (c + 1) % images.length) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setCurrent(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-[#FBE013]' : 'bg-white/50'}`}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ProductCard({ product }) {
  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no anúncio: "${product.title}"${product.tire_size ? ` (${product.tire_size})` : ''} pelo preço de ${product.price}. Poderia dar mais informações?`
  )

  return (
    <div className="bg-[#141414] border border-[#2D2D2D] rounded-xl overflow-hidden hover:border-[#FBE013]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <ProductImageGallery images={product.images} title={product.title} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FBE013] bg-[#FBE013]/10 px-2 py-1 rounded-full mb-2">
            <Tag className="w-3 h-3" />
            {product.condition || 'Segunda Mão'}
          </span>
          <h3 className="text-white font-semibold text-base leading-snug">{product.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-[#9CA3AF]">
          {product.tire_size && (
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              {product.tire_size}
            </span>
          )}
          {product.brand && (
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {product.brand}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-[#9CA3AF] text-sm leading-relaxed">{product.description}</p>
        )}

        <div className="mt-auto pt-3 border-t border-[#2D2D2D] flex items-center justify-between">
          <span className="text-[#FBE013] font-bold text-lg">{product.price}</span>
          <a
            href={`https://wa.me/351934803632?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors min-h-[40px]"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar
          </a>
        </div>
      </div>
    </div>
  )
}

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

export default function OfertasPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!error) setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
        <AnimatedSection animation="fadeUp" className="pt-12 pb-10">
          <SectionTitle
            title="Ofertas Especiais"
            subtitle="Pneus usados em bom estado a preços acessíveis. Stock limitado — contacta-nos para mais informações."
          />
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <AnimatedSection animation="fadeUp">
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-white text-xl font-semibold mb-2">Brevemente novas ofertas disponíveis</h2>
              <p className="text-[#9CA3AF] text-sm max-w-sm mx-auto">
                De momento não temos stock de pneus usados. Consulta-nos sobre pneus novos ou volta mais tarde.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <AnimatedSection key={product.id} animation="fadeUp" delay={i * 80}>
                <ProductCard product={product} />
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
