import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Filament } from '../../types'

const COSTING = {
  filamentKgPrice: 20000,
  kwhPrice: 140,
  printerW: 120,
  usefulH: 4320,
  partsPrice: 15000,
  errorMargin: 0.3,
  tithe: 0.1,
  defaultMultiplier: 8,
} as const

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)

interface MaterialRow {
  filamentId: string
  grams: number
}

interface CalcResult {
  materialCost: number
  electricityCost: number
  wearCost: number
  errorMargin: number
  manufacturingCost: number
  suggestedPrice: number
  netProfit: number
  tithe: number
  isEstimated: boolean
}

function calculate(
  printHours: number,
  profitMultiplier: number,
  salePrice: number,
  materialRows: MaterialRow[],
  fallbackGrams: number,
  filaments: Filament[],
): CalcResult {
  const multiplier = profitMultiplier > 0 ? profitMultiplier : COSTING.defaultMultiplier
  const hasRows = materialRows.length > 0

  let materialCost = 0
  if (hasRows) {
    materialCost = materialRows.reduce((sum, row) => {
      const filament = filaments.find(f => f.id === row.filamentId)
      if (!filament) return sum
      return sum + row.grams * (filament.pricePerKg / 1000)
    }, 0)
  } else if (fallbackGrams > 0) {
    materialCost = fallbackGrams * (COSTING.filamentKgPrice / 1000)
  }

  if (!printHours || printHours <= 0) {
    const netProfit = salePrice - materialCost
    return {
      materialCost,
      electricityCost: 0,
      wearCost: 0,
      errorMargin: 0,
      manufacturingCost: materialCost,
      suggestedPrice: materialCost * multiplier,
      netProfit,
      tithe: netProfit * COSTING.tithe,
      isEstimated: true,
    }
  }

  const electricityCost = printHours * (COSTING.printerW / 1000) * COSTING.kwhPrice
  const wearCost = printHours * (COSTING.partsPrice / COSTING.usefulH)
  const errorMarginVal = (materialCost + electricityCost + wearCost) * COSTING.errorMargin
  const manufacturingCost = materialCost + electricityCost + wearCost + errorMarginVal
  const suggestedPrice = manufacturingCost * multiplier
  const netProfit = salePrice - manufacturingCost

  return {
    materialCost,
    electricityCost,
    wearCost,
    errorMargin: errorMarginVal,
    manufacturingCost,
    suggestedPrice,
    netProfit,
    tithe: netProfit * COSTING.tithe,
    isEstimated: false,
  }
}

interface FilamentSelectProps {
  filaments: Filament[]
  value: string
  onChange: (id: string) => void
}

function FilamentSelect({ filaments, value, onChange }: FilamentSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = filaments.find(f => f.id === value)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none hover:border-[var(--color-accent)] transition-colors text-left"
      >
        <span
          className="size-3 rounded-full border border-white/20 flex-shrink-0"
          style={{ backgroundColor: selected?.colorHex ?? '#6B7280' }}
        />
        <span className="truncate">
          {selected
            ? `${selected.colorName} — ${selected.brandName} (${selected.material})`
            : 'Seleccioná...'}
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded border border-[var(--color-border-light)] bg-[var(--color-surface-2)] shadow-lg">
          {filaments.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => { onChange(f.id); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[var(--color-surface)] ${
                f.id === value ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'
              }`}
            >
              <span
                className="size-3 rounded-full border border-white/20 flex-shrink-0"
                style={{ backgroundColor: f.colorHex ?? '#6B7280' }}
              />
              <span className="truncate">{f.colorName} — {f.brandName} ({f.material})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface Calculator3DProps {
  filaments: Filament[]
  initialPrintHours?: number
  initialMultiplier?: number
  initialSalePrice?: number
  initialFallbackGrams?: number
  initialMaterialRows?: MaterialRow[]
  onSuggestedPrice?: (price: number) => void
  onSuggestedWeight?: (grams: number) => void
  onMaterialRowsChange?: (rows: MaterialRow[]) => void
  onPrintHoursChange?: (hours: number) => void
  onMultiplierChange?: (multiplier: number) => void
}

export default function Calculator3D({
  filaments,
  initialPrintHours = 0,
  initialMultiplier = 0,
  initialSalePrice = 0,
  initialFallbackGrams = 0,
  initialMaterialRows = [],
  onSuggestedPrice,
  onSuggestedWeight,
  onMaterialRowsChange,
  onPrintHoursChange,
  onMultiplierChange,
}: Calculator3DProps) {
  const [printHours, setPrintHours] = useState(initialPrintHours)
  const [multiplier, setMultiplier] = useState(initialMultiplier)
  const [salePrice, setSalePrice] = useState(initialSalePrice)
  const [fallbackGrams, setFallbackGrams] = useState(initialFallbackGrams)
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>(initialMaterialRows)

  function updateRows(next: MaterialRow[]) {
    setMaterialRows(next)
    onMaterialRowsChange?.(next)
  }

  const activeFilaments = filaments.filter(f => f.isActive)

  const result = useMemo(
    () => calculate(printHours, multiplier, salePrice, materialRows, fallbackGrams, filaments),
    [printHours, multiplier, salePrice, materialRows, fallbackGrams, filaments],
  )

  const showResult =
    printHours > 0 || fallbackGrams > 0 || materialRows.length > 0 || salePrice > 0

  const suggestedWeightGrams =
    materialRows.length > 0
      ? materialRows.reduce((sum, row) => sum + row.grams, 0)
      : fallbackGrams

  function addRow() {
    if (activeFilaments.length === 0) return
    updateRows([...materialRows, { filamentId: activeFilaments[0].id, grams: 0 }])
  }

  function removeRow(idx: number) {
    updateRows(materialRows.filter((_, i) => i !== idx))
  }

  function updateRow(idx: number, patch: Partial<MaterialRow>) {
    updateRows(materialRows.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  const fieldClass =
    'w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

  return (
    <div className="space-y-4 rounded-md border border-[var(--color-border-light)] bg-[var(--color-surface-2)] p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-accent)]">
        Calculadora 3D
      </p>

      {/* Base inputs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-secondary)]">Hs. impresión</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value={printHours || ''}
            onChange={e => {
              const val = parseFloat(e.target.value) || 0
              setPrintHours(val)
              onPrintHoursChange?.(val)
            }}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-secondary)]">Multiplicador</label>
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder="8"
            value={multiplier || ''}
            onChange={e => {
              const val = parseFloat(e.target.value) || 0
              setMultiplier(val)
              onMultiplierChange?.(val)
            }}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-secondary)]">Precio venta (ARS)</label>
          <input
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={salePrice || ''}
            onChange={e => setSalePrice(parseFloat(e.target.value) || 0)}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Multi-material rows */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-secondary)]">Materiales</span>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] transition-colors"
          >
            <Plus size={12} />
            Agregar material
          </button>
        </div>

        {materialRows.length === 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-secondary)]">
              Gs. filamento (fallback)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              value={fallbackGrams || ''}
              onChange={e => setFallbackGrams(parseFloat(e.target.value) || 0)}
              className={fieldClass}
            />
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Usando precio por defecto $20.000/kg. Agregá materiales para precio real.
            </p>
          </div>
        )}

        {materialRows.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <FilamentSelect
              filaments={activeFilaments}
              value={row.filamentId}
              onChange={id => updateRow(idx, { filamentId: id })}
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="gs"
                value={row.grams || ''}
                onChange={e => updateRow(idx, { grams: parseFloat(e.target.value) || 0 })}
                className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-[var(--color-text-muted)]">g</span>
            </div>
            <button
              type="button"
              onClick={() => removeRow(idx)}
              aria-label="Quitar material"
              className="rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Results */}
      {showResult && (
        <div className="border-t border-[var(--color-border)] pt-3 space-y-1">
          {result.isEstimated && (
            <p className="text-[10px] text-orange-400 mb-2">
              Estimado — sin horas de impresión completas.
            </p>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-[var(--color-text-secondary)]">Costo material:</span>
            <span className="font-mono text-[var(--color-text-primary)]">
              {fmt(result.materialCost)}
            </span>
            {!result.isEstimated && (
              <>
                <span className="text-[var(--color-text-secondary)]">Costo luz:</span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  {fmt(result.electricityCost)}
                </span>
                <span className="text-[var(--color-text-secondary)]">Desgaste:</span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  {fmt(result.wearCost)}
                </span>
                <span className="text-[var(--color-text-secondary)]">Margen error (30%):</span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  {fmt(result.errorMargin)}
                </span>
              </>
            )}
            <span className="text-[var(--color-text-secondary)]">Costo fabricación:</span>
            <span className="font-mono text-[var(--color-text-primary)] font-medium">
              {fmt(result.manufacturingCost)}
            </span>
            <span className="text-[var(--color-text-secondary)]">Precio sugerido:</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-[var(--color-accent)] font-medium">
                {fmt(result.suggestedPrice)}
              </span>
              {onSuggestedPrice && (
                <button
                  type="button"
                  onClick={() => onSuggestedPrice(Math.ceil(result.suggestedPrice))}
                  className="text-[10px] underline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Usar
                </button>
              )}
            </span>
            <span className="text-[var(--color-text-secondary)]">Ganancia neta:</span>
            <span
              className={`font-mono ${result.netProfit >= 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-red)]'}`}
            >
              {fmt(result.netProfit)}
            </span>
            <span className="text-[var(--color-text-secondary)]">Diezmo (10%):</span>
            <span className="font-mono text-[var(--color-text-primary)]">
              {fmt(result.tithe)}
            </span>
            <span className="text-[var(--color-text-secondary)]">Peso sugerido:</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-[var(--color-text-primary)]">
                {Math.ceil(suggestedWeightGrams)} g
              </span>
              {onSuggestedWeight && suggestedWeightGrams > 0 && (
                <button
                  type="button"
                  onClick={() => onSuggestedWeight(Math.ceil(suggestedWeightGrams))}
                  className="text-[10px] underline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Usar
                </button>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export type { MaterialRow }
