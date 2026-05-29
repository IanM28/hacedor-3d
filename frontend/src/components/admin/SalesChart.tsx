'use client'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDashboardSales } from '../../hooks/useDashboardSales'
import type { DashboardSalesPeriod } from '../../types'

interface PeriodOption {
  value: DashboardSalesPeriod
  label: string
}

const PERIODS: PeriodOption[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '1y', label: '1 Año' },
]

const formatARS = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: { orders: number } }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload[0]?.value ?? 0
  const orders = payload[0]?.payload?.orders ?? 0
  return (
    <div
      className="rounded border border-[var(--color-border-light)] bg-[var(--color-surface)] px-3 py-2 text-xs shadow-lg"
      style={{ minWidth: 140 }}
    >
      <p className="mb-1 font-medium text-[var(--color-text-secondary)] uppercase tracking-widest">
        {label}
      </p>
      <p className="font-mono text-[var(--color-text-primary)]">{formatARS(total)}</p>
      <p className="text-[var(--color-text-muted)]">
        {orders} {orders === 1 ? 'pedido' : 'pedidos'}
      </p>
    </div>
  )
}

export function SalesChart() {
  const [period, setPeriod] = useState<DashboardSalesPeriod>('30d')
  const { data, isLoading, isError } = useDashboardSales(period)

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
          Gráfico de ventas
        </h2>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={[
                'px-3 py-1 text-xs rounded transition-colors',
                period === p.value
                  ? 'bg-[var(--color-accent)] text-black font-medium'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 py-5" style={{ height: 280 }}>
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="h-full w-full bg-[var(--color-surface-2)] animate-pulse rounded" />
          </div>
        )}

        {isError && (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-[var(--color-text-muted)]">No se pudo cargar el gráfico.</p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4A7C59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={v => `$${Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(v as number)}`}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip content={<TooltipContent />} cursor={{ stroke: 'var(--color-border-light)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#4A7C59"
                strokeWidth={2}
                fill="url(#salesGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#5C9B6E', stroke: 'var(--color-surface)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
