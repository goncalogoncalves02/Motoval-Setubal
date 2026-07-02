import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import useSwipe from '../../hooks/useSwipe'

export default function ProductImageGallery({
  images,
  title,
  onOpen,
  heightClassName = 'h-52',
  roundedClassName = 'rounded-t-xl',
}) {
  const [current, setCurrent] = useState(0)
  const goNext = () => setCurrent((c) => (c + 1) % images?.length)
  const goPrev = () => setCurrent((c) => (c - 1 + images?.length) % images?.length)
  const swipeHandlers = useSwipe(goNext, goPrev)

  if (!images || images.length === 0) {
    return (
      <div className={`w-full ${heightClassName} bg-[#1A1A1A] flex items-center justify-center ${roundedClassName}`}>
        <span className="text-[#4A4A4A] text-sm">Sem imagem</span>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full ${heightClassName} ${roundedClassName} overflow-hidden bg-[#0A0A0A] group`}
      {...(images.length > 1 ? swipeHandlers : null)}
    >
      <img
        src={images[current]}
        alt={`${title} - foto ${current + 1}`}
        className={`w-full h-full object-cover ${onOpen ? 'cursor-zoom-in' : ''}`}
        onClick={onOpen ? (e) => { e.preventDefault(); e.stopPropagation(); onOpen(current) } : undefined}
      />

      {onOpen && (
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center cursor-zoom-in pointer-events-none"
        >
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-10"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-10"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i) }}
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
