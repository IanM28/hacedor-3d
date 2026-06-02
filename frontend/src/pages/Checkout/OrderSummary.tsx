import type { CartItem, SelectedShippingOption } from '../../types'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  selectedShipping?: SelectedShippingOption | null
}

export default function OrderSummary({ items, subtotal, selectedShipping }: OrderSummaryProps) {
  const total = subtotal + (selectedShipping?.price ?? 0)

  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-display text-2xl tracking-wide text-[var(--color-text-primary)]">
        RESUMEN
      </h2>

      <div className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
        {items.map(item => (
          <div key={item.productId} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <span className="font-mono text-xs text-[var(--color-accent)]">{item.code}</span>
              <p className="truncate font-body text-sm text-[var(--color-text-primary)]">
                {item.name}
              </p>
              <p className="font-body text-xs text-[var(--color-text-secondary)]">
                x{item.quantity}
              </p>
            </div>
            <span className="shrink-0 font-mono text-sm text-[var(--color-text-primary)]">
              ${(item.price * item.quantity).toLocaleString('es-AR')}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 border-t border-[var(--color-border)] pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-[var(--color-text-secondary)]">Subtotal</span>
          <span className="font-mono text-sm text-[var(--color-text-primary)]">
            ${subtotal.toLocaleString('es-AR')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-[var(--color-text-secondary)]">Envío</span>
          <span className="font-mono text-sm text-[var(--color-text-primary)]">
            {selectedShipping
              ? `$${selectedShipping.price.toLocaleString('es-AR')}`
              : '— por cotizar'}
          </span>
        </div>

        {selectedShipping && (
          <p className="font-mono text-xs text-[var(--color-text-muted)]">
            {selectedShipping.provider} · {selectedShipping.service} · {selectedShipping.estimatedDelivery}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2 mt-2">
          <span className="font-body text-sm font-medium text-[var(--color-text-primary)]">
            Total
          </span>
          <span className="font-mono text-xl text-[var(--color-text-primary)]">
            ${total.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-[var(--color-text-muted)]">
        El stock se confirma al crear el pedido.
      </p>
    </div>
  )
}
