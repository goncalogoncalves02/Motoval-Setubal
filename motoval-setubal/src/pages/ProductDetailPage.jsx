import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MessageCircle, Tag, Ruler, Award, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import { productSchema, breadcrumbSchema } from '../lib/seo/schema'
import { site } from '../data/site'
import { productSlug } from '../lib/slug'
import AnimatedSection from '../components/ui/AnimatedSection'
import ProductImageGallery from '../components/products/ProductImageGallery'
import Lightbox from '../components/products/Lightbox'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'found' | 'not-found'
  const [product, setProduct] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setProduct(null)

    async function fetchProduct() {
      const { data: candidates, error: listError } = await supabase
        .from('products')
        .select('id, title')
        .eq('is_active', true)

      if (cancelled) return
      if (listError || !candidates) {
        setStatus('not-found')
        return
      }

      const match = candidates.find((p) => productSlug(p) === slug)
      if (!match) {
        setStatus('not-found')
        return
      }

      const { data: full, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', match.id)
        .single()

      if (cancelled) return
      if (productError || !full) {
        setStatus('not-found')
        return
      }
      setProduct(full)
      setStatus('found')
    }

    fetchProduct()
    return () => { cancelled = true }
  }, [slug])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-10 lg:px-12 pt-12 animate-pulse">
          <div className="w-full h-80 bg-[#1A1A1A] rounded-xl mb-6" />
          <div className="h-6 bg-[#2D2D2D] rounded w-1/2 mb-3" />
          <div className="h-4 bg-[#2D2D2D] rounded w-1/3" />
        </div>
      </main>
    )
  }

  if (status === 'not-found') {
    return (
      <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
        <Seo
          title="Artigo não disponível | Motoval Setúbal"
          description="Este artigo já não está disponível. Consulta as nossas ofertas atuais de pneus em Palmela."
          path="/ofertas"
        />
        <div className="max-w-3xl mx-auto px-5 text-center py-24">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-white text-xl font-semibold mb-2">Este artigo já não está disponível</h1>
          <p className="text-[#9CA3AF] text-sm max-w-sm mx-auto mb-6">
            Pode já ter sido vendido ou removido. Consulta as nossas ofertas atuais.
          </p>
          <Link
            to="/ofertas"
            className="inline-flex items-center gap-2 bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold px-5 py-3 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Ver Ofertas
          </Link>
        </div>
      </main>
    )
  }

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no anúncio: "${product.title}"${product.tire_size ? ` (${product.tire_size})` : ''} pelo preço de ${product.price}. Poderia dar mais informações?`
  )
  const slugForProduct = productSlug(product)

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
      <Seo
        title={`${product.title} - ${product.price} | Motoval Setúbal`}
        description={`${product.title}${product.tire_size ? ` (${product.tire_size})` : ''} por ${product.price}. Pneus ${product.condition === 'Novos' ? 'novos' : 'usados'} em Palmela, contacta-nos via WhatsApp.`}
        path={`/ofertas/${slugForProduct}`}
        jsonLd={[
          productSchema(product),
          breadcrumbSchema(
            [
              { name: 'Início', path: '/' },
              { name: 'Ofertas', path: '/ofertas' },
              { name: product.title, path: `/ofertas/${slugForProduct}` },
            ],
            site
          ),
        ]}
      />
      <div className="max-w-5xl mx-auto px-5 sm:px-10 lg:px-12">
        <AnimatedSection animation="fadeUp" className="pt-8 pb-6">
          <Link
            to="/ofertas"
            className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#FBE013] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar às Ofertas
          </Link>
        </AnimatedSection>

        <AnimatedSection animation="fadeUp" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImageGallery
            images={product.images}
            title={product.title}
            onOpen={(index) => setLightboxIndex(index)}
            heightClassName="h-72 sm:h-96"
            roundedClassName="rounded-xl"
          />

          <div className="flex flex-col gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FBE013] bg-[#FBE013]/10 px-2 py-1 rounded-full mb-2">
                <Tag className="w-3 h-3" />
                {product.condition || 'Usados'}
              </span>
              <h1 className="text-white font-semibold text-2xl leading-snug">{product.title}</h1>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[#9CA3AF]">
              {product.tire_size && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {product.tire_size}
                </span>
              )}
              {product.brand && (
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {product.brand}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[#9CA3AF] text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="mt-auto pt-4 border-t border-[#2D2D2D] flex items-center justify-between">
              <span className="text-[#FBE013] font-bold text-2xl">{product.price}</span>
              <a
                href={`https://wa.me/351934803632?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                Contactar
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {lightboxIndex !== null && product.images?.length > 0 && (
        <Lightbox
          images={product.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  )
}
