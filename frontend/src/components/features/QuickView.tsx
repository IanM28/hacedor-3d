import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { useToast } from '../ui/useToast'
import { buildProductQuery } from '../../utils/whatsapp'
import type { Product } from '../../types'

export interface QuickViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [isOpen, handleKeyDown])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={e => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
            onMouseDown={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista rápida"
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              <X className="size-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="aspect-square overflow-hidden bg-[var(--color-surface-2)] sm:rounded-bl-md sm:rounded-tl-md">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-mono text-xs text-[var(--color-text-muted)]">{product.code}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 p-5">
                <div>
                  <span className="font-mono text-xs text-[var(--color-accent)]">{product.code}</span>
                  <p className="mt-1 font-body font-medium text-[var(--color-text-primary)]">{product.name}</p>
                  <p className="mt-2 font-mono text-lg text-[var(--color-text-primary)]">
                    ${product.price.toLocaleString('es-AR')}
                  </p>
                </div>

                <Badge variant="muted">{product.category.name}</Badge>

                <p className={`font-mono text-xs ${product.stock === 0 ? 'text-[var(--color-red)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {product.stock === 0 ? 'Sin stock disponible.' : `${product.stock} unidades disponibles`}
                </p>

                <div className="mt-auto flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={product.stock === 0}
                    onClick={() => toast.info('Carrito disponible en la siguiente fase.')}
                    className="w-full"
                  >
                    {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { navigate(`/productos/${product.id}`); onClose() }}
                    className="w-full"
                  >
                    Ver detalle
                  </Button>
                  <Button
                    size="sm"
                    variant="whatsapp"
                    onClick={() => window.open(buildProductQuery(product.code, product.name), '_blank', 'noopener,noreferrer')}
                    className="w-full"
                  >
                    Consultar por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
