import { useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Landmark,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { SalesChart } from '../../../components/admin/SalesChart'
import { ManualTitheCalculator } from '../../../components/admin/ManualTitheCalculator'
import { useDashboardStats } from '../../../hooks/useDashboardStats'

const formatARS = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

interface StatCardProps {
  label: string
  value: string
  icon: React.ElementType
  sub?: React.ReactNode
  alert?: boolean
}

function StatCard({ label, value, icon: Icon, sub, alert }: StatCardProps) {
  return (
    <div
      className={[
        'bg-[var(--color-surface)] border rounded p-5 flex flex-col gap-3 transition-colors',
        alert
          ? 'border-[var(--color-red)]/40'
          : 'border-[var(--color-border)]',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
          {label}
        </span>
        <Icon
          size={18}
          className={alert ? 'text-[var(--color-red)]' : 'text-[var(--color-accent)]'}
        />
      </div>
      <p className="font-mono text-2xl tracking-tight text-[var(--color-text-primary)]">{value}</p>
      {sub && <div className="text-xs text-[var(--color-text-secondary)]">{sub}</div>}
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded animate-pulse"
        />
      ))}
    </div>
  )
}

function TitheSectionDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
        Calculador de diezmo
      </span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats()
  const [calculatorOpen, setCalculatorOpen] = useState(false)

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
          DASHBOARD
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Resumen operativo</p>
      </div>

      {/* Stat cards */}
      {isLoading && <StatsSkeleton />}

      {error && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          {error.message ?? 'Error al cargar el dashboard.'}
        </p>
      )}

      {stats && !isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Ventas totales"
            value={formatARS(stats.totalSales)}
            icon={TrendingUp}
          />

          <StatCard
            label="Pedidos (30d)"
            value={String(stats.monthlyOrders)}
            icon={ShoppingCart}
          />

          <StatCard
            label="Productos activos"
            value={String(stats.activeProducts)}
            icon={Package}
          />

          <StatCard
            label="Stock bajo"
            value={String(stats.lowStockProducts)}
            icon={AlertTriangle}
            alert={stats.lowStockProducts > 0}
            sub={
              stats.lowStockProducts > 0 ? (
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-red)]/20 text-[var(--color-red)] uppercase tracking-wide">
                  Atención requerida
                </span>
              ) : (
                <span className="text-[var(--color-text-muted)]">Sin alertas</span>
              )
            }
          />

          <StatCard
            label="Diezmo general"
            value={formatARS(stats.generalTithe)}
            icon={Landmark}
            sub={
              <span className="text-[var(--color-text-muted)]">10% de ventas concretadas</span>
            }
          />
        </div>
      )}

      {/* Sales chart */}
      <SalesChart />

      {/* Manual Tithe Calculator */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded overflow-hidden">
        <button
          onClick={() => setCalculatorOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Landmark size={16} className="text-[var(--color-accent)]" />
            <span className="text-sm font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
              Calculador manual de diezmo por lote
            </span>
          </div>
          {calculatorOpen ? (
            <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          )}
        </button>

        {calculatorOpen && (
          <div className="p-5 space-y-4">
            <TitheSectionDivider />
            <p className="text-xs text-[var(--color-text-muted)]">
              Seleccioná productos y cantidades para calcular el diezmo de un lote específico.
              Este cálculo es local y no se guarda.
            </p>
            <ManualTitheCalculator />
          </div>
        )}
      </div>
    </div>
  )
}
