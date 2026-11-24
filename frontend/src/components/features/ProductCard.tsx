import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useCartStore } from '../../store/cartStore'
import type { Product } from '../../types'

export interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const navigate = useNavigate()
  const { addItem } = useCartStore()

  const secondImage = product.images[1]
  const displayImage = hovered && secondImage ? secondImage : product.images[0]
  const showImage = Boolean(displayImage) && failedSrc !== displayImage
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock < 5

  function handleAddToCart() {
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      addItem(product)
    }
  }

  const stockLabel = outOfStock
    ? 'Sin stock'
    : lowStock
      ? `Últimas ${product.stock} unidades`
      : 'En stock'
  const stockClass = outOfStock || lowStock
    ? 'text-[var(--color-red)]'
    : 'text-[var(--color-text-secondary)]'

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex h-full flex-col rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-accent)]"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-md bg-[var(--color-surface-2)]">
        {showImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-contain p-4"
            onError={() => setFailedSrc(displayImage)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-xs text-[var(--color-text-muted)]">{product.code}</span>
          </div>
        )}

        {product.isFeatured && (
          <div className="absolute left-2 top-2">
            <Badge variant="accent">Destacado</Badge>
          </div>
        )}

        {onQuickView && hovered && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onQuickView(product) }}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-mono text-[10px] tracking-wide text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-light)]"
            >
              Vista rápida
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span className="font-mono text-xs text-[var(--color-accent)]">{product.code}</span>
          <p className="mt-1 font-body text-sm text-[var(--color-text-primary)]">{product.name}</p>
        </div>
        <p className="font-mono text-base text-[var(--color-text-primary)]">
          ${product.price.toLocaleString('es-AR')}
        </p>
        <p className={`font-mono text-xs ${stockClass}`}>{stockLabel}</p>
        <div className="mt-auto flex flex-col items-center gap-2">
          <Button size="sm" variant="primary" disabled={outOfStock} onClick={handleAddToCart} className="w-full">
            {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
          </Button>
          <button
            type="button"
            onClick={() => navigate(`/productos/${product.id}`)}
            className="font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  )
}
