import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Tag, Ruler, Award } from 'lucide-react'
import ProductImageGallery from './ProductImageGallery'
import Lightbox from './Lightbox'
import { productSlug } from '../../lib/slug'
import { productWhatsappUrl } from '../../lib/whatsapp'

export default function ProductCard({ product }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  return (
    <>
      <Link
        to={`/ofertas/${productSlug(product)}`}
        className="bg-[#141414] border border-[#2D2D2D] rounded-xl overflow-hidden hover:border-[#FBE013]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
      >
        <ProductImageGallery
          images={product.images}
          title={product.title}
          onOpen={(index) => setLightboxIndex(index)}
        />

        <div className="p-5 flex flex-col flex-1 gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FBE013] bg-[#FBE013]/10 px-2 py-1 rounded-full mb-2">
              <Tag className="w-3 h-3" />
              {product.condition || 'Usados'}
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
            <p className="text-[#9CA3AF] text-sm leading-relaxed line-clamp-3">{product.description}</p>
          )}

          <div className="mt-auto pt-3 border-t border-[#2D2D2D] flex items-center justify-between">
            <span className="text-[#FBE013] font-bold text-lg">{product.price}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                window.open(productWhatsappUrl(product), '_blank', 'noopener,noreferrer')
              }}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors min-h-[40px]"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar
            </button>
          </div>
        </div>
      </Link>

      {lightboxIndex !== null && product.images?.length > 0 && (
        <Lightbox
          images={product.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
