import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useCartStore } from '../../store/cartStore'
import { buildProductQuery } from '../../utils/whatsapp'
import type { Product } from '../../types'

interface DimPillProps {
  label: string
  value: number
  axis: string
}

function DimPill({ label, value, axis }: DimPillProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded border border-[var(--color-border)] bg-zinc-900/60 px-3 py-2 min-w-0">
      <span
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {axis}
      </span>
      <span className="font-mono text-base font-medium text-[var(--color-text-primary)] leading-none">
        {value}
      </span>
      <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{label} · mm</span>
    </div>
  )
}

function ProductDimensions({
  x,
  y,
  z,
}: {
  x: number | null | undefined
  y: number | null | undefined
  z: number | null | undefined
}) {
  if (!x && !y && !z) return null

  return (
    <div className="rounded-md border border-[var(--color-border)] bg-zinc-900/40 p-3">
      <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        Dimensiones de la pieza
      </p>
      <div className="grid grid-cols-3 gap-2">
        {x != null && <DimPill axis="X" label="Ancho" value={x} />}
        {y != null && <DimPill axis="Y" label="Largo" value={y} />}
        {z != null && <DimPill axis="Z" label="Alto" value={z} />}
      </div>
    </div>
  )
}

export default function ProductInfo({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCartStore()
  const outOfStock = product.stock === 0
  const lowStock = !outOfStock && product.stock < 5

  const stockColor = outOfStock || lowStock
    ? 'text-[var(--color-red)]'
    : 'text-[var(--color-text-secondary)]'

  const stockLabel = outOfStock
    ? 'Sin stock disponible.'
    : lowStock
      ? `Últimas ${product.stock} unidades`
      : `${product.stock} unidades disponibles`

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="font-mono text-sm text-[var(--color-accent)]">{product.code}</span>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-wide text-[var(--color-text-primary)] sm:text-5xl">
          {product.name}
        </h1>
        <p className="mt-3 font-mono text-2xl text-[var(--color-text-primary)]">
          ${product.price.toLocaleString('es-AR')}
        </p>
      </div>

      <Badge variant="muted">{product.category.name}</Badge>

      <p className="font-body text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-line">
        {product.description}
      </p>

      <ProductDimensions
        x={product.dimensionX}
        y={product.dimensionY}
        z={product.dimensionZ}
      />

      <p className={`font-mono text-xs ${stockColor}`}>{stockLabel}</p>

      {!outOfStock && (
        <div className="flex items-center gap-3">
          <span className="font-body text-sm text-[var(--color-text-secondary)]">Cantidad</span>
          <div className="flex items-center rounded-md border border-[var(--color-border)]">
            <button
              type="button"
              aria-label="Reducir cantidad"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="flex size-8 items-center justify-center rounded-l-md text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] disabled:opacity-40"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-8 text-center font-mono text-sm text-[var(--color-text-primary)]">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              disabled={qty >= product.stock}
              className="flex size-8 items-center justify-center rounded-r-md text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] disabled:opacity-40"
            >
              <Plus className="size-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          disabled={outOfStock}
          onClick={() => addItem(product, qty)}
          className="w-full"
        >
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
        <Button
          variant="whatsapp"
          onClick={() =>
            window.open(buildProductQuery(product.code, product.name), '_blank', 'noopener,noreferrer')
          }
          className="w-full"
        >
          Consultar por WhatsApp
        </Button>
      </div>
    </div>
  )
}
