import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 1

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i)
    } else if (
      i === currentPage - delta - 1 ||
      i === currentPage + delta + 1
    ) {
      pages.push('...')
    }
  }

  // Remove ellipsis duplicados
  const deduped = pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'))

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>

      <div className="flex items-center gap-1 mx-1">
        {deduped.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2 text-[#4B5563] text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-[#FBE013] text-[#0A0A0A] font-bold'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]'
              }`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#9CA3AF] hover:text-white hover:bg-[#1F1F1F]"
        aria-label="Próxima página"
      >
        Seguinte
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
