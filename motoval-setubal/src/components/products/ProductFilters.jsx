import { useState } from 'react'
import { SlidersHorizontal, X, Check } from 'lucide-react'
import { PRICE_BUCKETS } from '../../lib/priceBuckets'
import FilterDropdown from './FilterDropdown'

const CONDITIONS = ['Novos', 'Usados']

function OptionRow({ label, checked, onClick, shape = 'checkbox' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left text-white hover:bg-[#1F1F1F] transition-colors min-h-[40px]"
    >
      <span
        className={`flex items-center justify-center w-4 h-4 border shrink-0 ${
          shape === 'radio' ? 'rounded-full' : 'rounded'
        } ${checked ? 'bg-[#FBE013] border-[#FBE013]' : 'border-[#4A4A4A]'}`}
      >
        {checked && <Check className="w-3 h-3 text-[#0A0A0A]" />}
      </span>
      {label}
    </button>
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
  const [openFilter, setOpenFilter] = useState(null)
  const activeCount =
    selectedBrands.length + selectedSizes.length + selectedConditions.length + (selectedPriceBucket ? 1 : 0)

  function toggleOpenFilter(key) {
    setOpenFilter((current) => (current === key ? null : key))
  }

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

      <div className={`${mobileOpen ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-3`}>
        {brandOptions.length > 0 && (
          <FilterDropdown
            label="Marca"
            count={selectedBrands.length}
            isOpen={openFilter === 'marca'}
            onToggle={() => toggleOpenFilter('marca')}
            onClose={() => setOpenFilter(null)}
          >
            {brandOptions.map((brand) => (
              <OptionRow
                key={brand}
                label={brand}
                checked={selectedBrands.includes(brand)}
                onClick={() => onToggleBrand(brand)}
              />
            ))}
          </FilterDropdown>
        )}

        {sizeOptions.length > 0 && (
          <FilterDropdown
            label="Medida"
            count={selectedSizes.length}
            isOpen={openFilter === 'medida'}
            onToggle={() => toggleOpenFilter('medida')}
            onClose={() => setOpenFilter(null)}
          >
            {sizeOptions.map((size) => (
              <OptionRow
                key={size}
                label={size}
                checked={selectedSizes.includes(size)}
                onClick={() => onToggleSize(size)}
              />
            ))}
          </FilterDropdown>
        )}

        <FilterDropdown
          label="Condição"
          count={selectedConditions.length}
          isOpen={openFilter === 'condicao'}
          onToggle={() => toggleOpenFilter('condicao')}
          onClose={() => setOpenFilter(null)}
        >
          {CONDITIONS.map((condition) => (
            <OptionRow
              key={condition}
              label={condition}
              checked={selectedConditions.includes(condition)}
              onClick={() => onToggleCondition(condition)}
            />
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Preço"
          count={selectedPriceBucket ? 1 : 0}
          isOpen={openFilter === 'preco'}
          onToggle={() => toggleOpenFilter('preco')}
          onClose={() => setOpenFilter(null)}
        >
          {PRICE_BUCKETS.map((bucket) => (
            <OptionRow
              key={bucket.id}
              label={bucket.label}
              checked={selectedPriceBucket === bucket.id}
              onClick={() => onSelectPriceBucket(bucket.id)}
              shape="radio"
            />
          ))}
        </FilterDropdown>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#FBE013] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
