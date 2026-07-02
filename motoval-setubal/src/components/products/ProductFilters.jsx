import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { PRICE_BUCKETS } from '../../lib/priceBuckets'

const CONDITIONS = ['Novos', 'Usados']

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors min-h-[40px] ${
        active
          ? 'bg-[#FBE013] border-[#FBE013] text-[#0A0A0A] font-semibold'
          : 'border-[#2D2D2D] text-[#9CA3AF] hover:border-[#FBE013]/50 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function FilterGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export default function ProductFilters({
  brandOptions,
  sizeOptions,
  selectedBrands,
  selectedSizes,
  selectedConditions,
  selectedPriceBucket,
  onToggleBrand,
  onToggleSize,
  onToggleCondition,
  onSelectPriceBucket,
  onClear,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeCount =
    selectedBrands.length + selectedSizes.length + selectedConditions.length + (selectedPriceBucket ? 1 : 0)

  return (
    <div className="mb-8">
      <div className="sm:hidden mb-3">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 border border-[#2D2D2D] rounded-lg px-4 py-3 text-white text-sm font-medium min-h-[44px]"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeCount > 0 && (
              <span className="bg-[#FBE013] text-[#0A0A0A] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </span>
        </button>
      </div>

      <div
        className={`${mobileOpen ? 'flex' : 'hidden'} sm:flex flex-col gap-5 bg-[#141414] border border-[#2D2D2D] rounded-xl p-4 sm:p-5`}
      >
        {brandOptions.length > 0 && (
          <FilterGroup label="Marca">
            {brandOptions.map((brand) => (
              <FilterChip key={brand} active={selectedBrands.includes(brand)} onClick={() => onToggleBrand(brand)}>
                {brand}
              </FilterChip>
            ))}
          </FilterGroup>
        )}

        {sizeOptions.length > 0 && (
          <FilterGroup label="Medida">
            {sizeOptions.map((size) => (
              <FilterChip key={size} active={selectedSizes.includes(size)} onClick={() => onToggleSize(size)}>
                {size}
              </FilterChip>
            ))}
          </FilterGroup>
        )}

        <FilterGroup label="Condição">
          {CONDITIONS.map((condition) => (
            <FilterChip
              key={condition}
              active={selectedConditions.includes(condition)}
              onClick={() => onToggleCondition(condition)}
            >
              {condition}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Preço">
          {PRICE_BUCKETS.map((bucket) => (
            <FilterChip
              key={bucket.id}
              active={selectedPriceBucket === bucket.id}
              onClick={() => onSelectPriceBucket(bucket.id)}
            >
              {bucket.label}
            </FilterChip>
          ))}
        </FilterGroup>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="self-start flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#FBE013] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
