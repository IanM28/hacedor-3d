import { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { useAdminOrders } from '../../../hooks/useAdminOrders'
import { OrderDetail } from './OrderDetail'
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
  CONFIRMED:
    'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-dim)]',
  IN_PRODUCTION: 'bg-blue-900/40 text-blue-300 border border-blue-800/50',
  PREPARING: 'bg-orange-900/40 text-orange-300 border border-orange-800/50',
  SHIPPED: 'bg-purple-900/40 text-purple-300 border border-purple-800/50',
  DELIVERED: 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50',
  CANCELLED: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
}

const FILTER_OPTIONS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Confirmado', value: 'CONFIRMED' },
  { label: 'En producción', value: 'IN_PRODUCTION' },
  { label: 'Preparando', value: 'PREPARING' },
  { label: 'Enviado', value: 'SHIPPED' },
  { label: 'Entregado', value: 'DELIVERED' },
]

const PAYMENT_LABEL: Record<string, string> = {
  MERCADOPAGO: 'MP',
  TRANSFER: 'Transf.',
  CASH: 'Efectivo',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
}

function shortId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export default function AdminOrders() {
  const [filters, setFilters] = useState<AdminOrderFilters>({ page: 1, limit: 20 })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isError } = useAdminOrders(filters)

  const setStatus = (status: OrderStatus | undefined) => {
    setFilters(prev => ({ ...prev, status, page: 1 }))
  }

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const meta = data?.meta
  const orders = data?.items ?? []

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
          PEDIDOS
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {meta ? `${meta.total} pedido${meta.total !== 1 ? 's' : ''}` : ''}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.label}
            onClick={() => setStatus(opt.value)}
            className={[
              'px-3 py-1.5 rounded text-xs font-medium transition-colors',
              filters.status === opt.value
                ? 'bg-[var(--color-accent)] text-black'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">
                  ID / Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)] hidden md:table-cell">
                  Ítems
                </th>
                <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Ver
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-text-secondary)] text-sm">
                    Cargando pedidos...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-red)] text-sm">
                    Error al cargar los pedidos.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-text-secondary)] text-sm">
                    Sin pedidos para este filtro.
                  </td>
                </tr>
              )}

              {orders.map(order => {
                const clientName = order.user
                  ? `${order.user.name} ${order.user.lastName}`
                  : order.guestEmail ?? order.contactName
                const clientSub = order.user ? order.user.email : 'Invitado'
                const itemsSummary = order.items
                  .slice(0, 2)
                  .map(i => `${i.product.code} ×${i.quantity}`)
                  .join(', ')
                const moreItems = order.items.length > 2 ? ` +${order.items.length - 2}` : ''

                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className="border-b border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors group"
                    tabIndex={0}
                    aria-label={`Ver pedido ${shortId(order.id)}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedId(order.id)
                    }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-[var(--color-accent)]">
                        {shortId(order.id)}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-[var(--color-text-primary)] truncate max-w-[140px]">
                        {clientName}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[140px]">
                        {clientSub}
                      </p>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-mono text-xs text-[var(--color-text-secondary)] truncate max-w-[180px]">
                        {itemsSummary}
                        {moreItems && (
                          <span className="text-[var(--color-text-muted)]">{moreItems}</span>
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm text-[var(--color-text-primary)]">
                        {formatPrice(order.total)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${STATUS_STYLE[order.status]}`}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedId(order.id)
                        }}
                        aria-label={`Abrir pedido ${shortId(order.id)}`}
                        className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Página {meta.page} de {meta.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(meta.page - 1)}
              disabled={meta.page <= 1}
              aria-label="Página anterior"
              className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              aria-label="Página siguiente"
              className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedId && (
        <OrderDetail
          orderId={selectedId}
          filters={filters}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
