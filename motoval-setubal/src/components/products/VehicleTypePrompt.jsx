import { useEffect, useRef } from 'react'
import { Bike, Car } from 'lucide-react'

const OPTIONS = [
  { value: 'carro', label: 'Pneus para carro', Icon: Car },
  { value: 'mota', label: 'Pneus para mota', Icon: Bike },
]

export default function VehicleTypePrompt({ onSelect }) {
  const dialogRef = useRef(null)
  const firstButtonRef = useRef(null)

  useEffect(() => {
    const previousActive = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstButtonRef.current?.focus()

    function trapFocus(event) {
      if (event.key !== 'Tab') return
      const buttons = Array.from(
        dialogRef.current?.querySelectorAll('button:not([disabled])') || []
      )
      if (buttons.length === 0) return

      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      document.body.style.overflow = previousOverflow
      previousActive?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md px-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-type-title"
        className="w-full max-w-xl rounded-2xl border border-[#2D2D2D] bg-[#141414] p-6 shadow-2xl sm:p-8"
      >
        <h2 id="vehicle-type-title" className="text-center text-2xl font-bold text-white sm:text-3xl">
          Que tipo de pneus procura?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-[#9CA3AF] sm:text-base">
          Escolha uma opção para mostrarmos primeiro os pneus certos para si.
        </p>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {OPTIONS.map((option, index) => {
            const { value, label, Icon } = option
            return (
              <button
                key={value}
                ref={index === 0 ? firstButtonRef : undefined}
                type="button"
                onClick={() => onSelect(value)}
                className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-[#3D3D3D] bg-[#1A1A1A] p-5 text-white transition-colors hover:border-[#FBE013] hover:text-[#FBE013] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBE013]"
              >
                <Icon className="h-9 w-9" aria-hidden="true" />
                <span className="font-semibold">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
