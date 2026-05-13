import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import CartItem from '../features/CartItem'
import Button from '../ui/Button'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { items, isOpen, closeDrawer, total, itemCount } = useCartStore()
  const count = itemCount()
  const orderTotal = total()

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-display text-2xl tracking-wide text-[var(--color-text-primary)]">
                MI PEDIDO
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Cerrar carrito"
                className="rounded-md p-1.5 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <p className="font-body text-[var(--color-text-secondary)]">
                    Tu carrito está vacío.
                  </p>
                  <Link
                    to="/catalogo"
                    onClick={closeDrawer}
                    className="font-body text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                  >
                    Ver colección →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {items.map(item => (
                    <CartItem key={item.productId} item={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-[var(--color-text-secondary)]">
                  Subtotal
                </span>
                <span className="font-mono text-base text-[var(--color-text-primary)]">
                  ${orderTotal.toLocaleString('es-AR')}
                </span>
              </div>
              <Button
                variant="primary"
                disabled={count === 0}
                onClick={() => {
                  closeDrawer()
                  navigate('/checkout')
                }}
                className="w-full"
              >
                Finalizar pedido
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
