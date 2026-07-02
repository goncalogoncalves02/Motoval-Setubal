import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FilterDropdown({ label, count, isOpen, onToggle, onClose, children }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose()
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${
          count > 0
            ? 'bg-[#FBE013] border-[#FBE013] text-[#0A0A0A] font-semibold'
            : 'border-[#2D2D2D] text-[#9CA3AF] hover:border-[#FBE013]/50 hover:text-white'
        }`}
      >
        {label}
        {count > 0 && <span>({count})</span>}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-20 min-w-[220px] max-h-72 overflow-y-auto bg-[#141414] border border-[#2D2D2D] rounded-lg shadow-xl p-2">
          {children}
        </div>
      )}
    </div>
  )
}
