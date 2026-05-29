import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Package } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useCallback } from 'react'
import { useAdminOrder } from '../../../hooks/useAdminOrder'
import { useToast } from '../../../components/ui/useToast'
import { orderService } from '../../../services/order.service'
import type { AdminOrderFilters, OrderStatus } from '../../../types'

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PRODUCTION: 'En producción',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-red-900/40 text-red-300 border border-red-800/50',
  CONFIRMED: 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-dim)]',
  IN_PRODUCTION: 'bg-blue-900/40 text-blue-300 border border-blue-800/50',
  PREPARING: 'bg-orange-900/40 text-orange-300 border border-orange-800/50',
  SHIPPED: 'bg-purple-900/40 text-purple-300 border border-purple-800/50',
  DELIVERED: 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50',
  CANCELLED: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
}

const PAYMENT_LABEL: Record<string, string> = {
  MERCADOPAGO: 'MercadoPago',
  TRANSFER: 'Transferencia',
  CASH: 'Efectivo',
}

const VALID_NEXT: Record<string, OrderStatus | null> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'IN_PRODUCTION',
  IN_PRODUCTION: 'PREPARING',
  PREPARING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
}

function shortId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

interface OrderDetailProps {
  orderId: string
  filters: AdminOrderFilters
  onClose: () => void
}

export function OrderDetail({ orderId, filters, onClose }: OrderDetailProps) {
  const { data: order, isLoading, isError } = useAdminOrder(orderId)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [handleKeyDown])

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => orderService.updateAdminStatus(orderId, status),
    onSuccess: () => {
      toast.success('Estado actualizado.')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders', filters] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders', orderId] })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Error al actualizar el estado.')
    },
  })

  const nextStatus = order ? VALID_NEXT[order.status] : null

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 md:items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)] z-10">
          <h2
            id="order-detail-title"
            className="font-heading text-xl tracking-widest text-[var(--color-text-primary)]"
          >
            {isLoading ? 'CARGANDO...' : order ? shortId(order.id) : 'PEDIDO'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {isLoading && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
              Cargando pedido...
            </p>
          )}

          {isError && (
            <p className="text-sm text-[var(--color-red)] text-center py-8">
              Error al cargar el pedido.
            </p>
          )}

          {order && (
            <>
              {/* Status + date */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium ${STATUS_STYLE[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              {/* Contact */}
              <section>
                <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                  Contacto y envío
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <DetailRow label="Nombre" value={order.contactName} />
                  <DetailRow
                    label="Email"
                    value={order.guestEmail ?? order.user?.email ?? '—'}
                  />
                  <DetailRow label="Teléfono" value={order.phone} />
                  <DetailRow label="Dirección" value={order.address} />
                </dl>
              </section>

              {/* Payment */}
              <section>
                <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                  Pago
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <DetailRow label="Método" value={PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod} />
                  <DetailRow label="Total" value={formatPrice(order.total)} />
                  <DetailRow label="Envío" value={formatPrice(order.shippingCost)} />
                  {order.mpPaymentId && (
                    <DetailRow label="MP Payment ID" value={order.mpPaymentId} mono />
                  )}
                </dl>
              </section>

              {/* Items */}
              <section>
                <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                  Ítems ({order.items.length})
                </h3>
                <ul className="space-y-2">
                  {order.items.map(item => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                    >
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded bg-[var(--color-border)] flex-shrink-0">
                          <Package size={20} className="text-[var(--color-text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-[var(--color-accent)] truncate">
                          {item.product.code}
                        </p>
                        <p className="text-sm text-[var(--color-text-primary)] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-mono text-[var(--color-text-primary)] flex-shrink-0">
                        {formatPrice(item.quantity * item.unitPrice)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Status update */}
              {nextStatus && (
                <section className="pt-2 border-t border-[var(--color-border)]">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                    Avanzar estado
                  </h3>
                  <button
                    onClick={() => mutation.mutate(nextStatus)}
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {mutation.isPending ? 'Actualizando...' : `Marcar como ${STATUS_LABEL[nextStatus]}`}
                  </button>
                  <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                    {STATUS_LABEL[order.status]} → {STATUS_LABEL[nextStatus]}
                  </p>
                </section>
              )}

              {!nextStatus && order.status !== 'CANCELLED' && (
                <p className="text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
                  Estado final. No hay más transiciones disponibles.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-[var(--color-text-secondary)] text-xs mb-0.5">{label}</dt>
      <dd
        className={`text-[var(--color-text-primary)] break-all ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}
