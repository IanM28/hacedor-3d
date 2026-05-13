import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import type { CartItem as CartItemType } from '../../types'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-3 py-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-2)]">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{item.code}</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-mono text-xs text-[var(--color-accent)]">{item.code}</span>
        <p className="truncate font-body text-sm text-[var(--color-text-primary)]">{item.name}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-md border border-[var(--color-border)]">
            <button
              type="button"
              aria-label="Reducir cantidad"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="flex size-7 items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-6 text-center font-mono text-xs text-[var(--color-text-primary)]">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="flex size-7 items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] disabled:opacity-40"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <span className="font-mono text-sm text-[var(--color-text-primary)]">
            ${(item.price * item.quantity).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Eliminar ${item.name}`}
        onClick={() => removeItem(item.productId)}
        className="self-start rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-red)]"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
