import { Landmark, Package, TrendingUp, Users } from 'lucide-react'
import { useDashboardSales } from '../../../hooks/useDashboardSales'
import { useDashboardStats } from '../../../hooks/useDashboardStats'
import type { OrderStatus } from '../../../types'

const formatARS = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]',
  CONFIRMED: 'bg-blue-900/40 text-blue-300',
  PREPARING: 'bg-orange-900/40 text-orange-300',
  SHIPPED: 'bg-violet-900/40 text-violet-300',
  DELIVERED: 'bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]',
  CANCELLED: 'bg-red-900/30 text-red-400',
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ElementType
  sub?: React.ReactNode
}

function StatCard({ label, value, icon: Icon, sub }: StatCardProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
          {label}
        </span>
        <Icon size={18} className="text-[var(--color-accent)]" />
      </div>
      <p className="text-2xl font-heading tracking-wide text-[var(--color-text-primary)]">{value}</p>
      {sub && <div className="text-xs text-[var(--color-text-secondary)]">{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: sales, isLoading: salesLoading, error: salesError } = useDashboardSales()

  if (statsLoading || salesLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded animate-pulse" />
      </div>
    )
  }

  if (statsError || salesError) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {statsError?.message ?? salesError?.message ?? 'Error al cargar el dashboard.'}
        </p>
      </div>
    )
  }

  if (!stats || !sales) return null

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
          DASHBOARD
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Resumen operativo</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Clientes" value={String(stats.totalClients)} icon={Users} />

        <StatCard
          label="Ventas del mes"
          value={formatARS(stats.monthlySales)}
          icon={TrendingUp}
        />

        <StatCard label="Productos activos" value={String(stats.activeProducts)} icon={Package} />

        <StatCard
          label="Diezmo acumulado"
          value={formatARS(stats.titheAmount)}
          icon={Landmark}
          sub={
            <div className="space-y-1">
              <p>Ganancia neta: {formatARS(stats.netProfit)}</p>
              {stats.isProfitEstimated && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-900/40 text-orange-300 uppercase tracking-wide">
                  Estimado
                </span>
              )}
            </div>
          }
        />
      </div>

      {/* Recent sales table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
            Ventas recientes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {['ID', 'Cliente', 'Total', 'Estado', 'Fecha'].map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => {
                const clientName = sale.user
                  ? `${sale.user.name} ${sale.user.lastName}`
                  : (sale.guestEmail ?? sale.contactName)
                return (
                  <tr
                    key={sale.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-accent)] whitespace-nowrap">
                      #{sale.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)] max-w-[180px] truncate">
                      {clientName}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)] whitespace-nowrap">
                      {formatARS(sale.total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[sale.status]}`}
                      >
                        {STATUS_LABELS[sale.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                      {formatDate(sale.createdAt)}
                    </td>
                  </tr>
                )
              })}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                    Sin ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
