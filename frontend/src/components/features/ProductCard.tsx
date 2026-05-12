import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useToast } from '../ui/useToast'
import type { Product } from '../../types'

export interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const secondImage = product.images[1]
  const displayImage = hovered && secondImage ? secondImage : product.images[0]
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock < 5

  function handleAddToCart() {
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      toast.info('Carrito disponible en la siguiente fase.')
    }
  }

  return (
    <motion.article
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex flex-col rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-accent)]"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-md bg-[var(--color-surface-2)]">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-xs text-[var(--color-text-muted)]">{product.code}</span>
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isFeatured && <Badge variant="accent">Destacado</Badge>}
          {lowStock && <Badge variant="danger">Últimas {product.stock} unidades</Badge>}
          {outOfStock && <Badge variant="muted">Sin stock</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span className="font-mono text-xs text-[var(--color-accent)]">{product.code}</span>
          <p className="mt-1 font-body text-sm text-[var(--color-text-primary)]">{product.name}</p>
        </div>
        <p className="font-mono text-base text-[var(--color-text-primary)]">
          ${product.price.toLocaleString('es-AR')}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="w-full"
          >
            {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/productos/${product.id}`)}
            className="w-full"
          >
            Ver detalle
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
