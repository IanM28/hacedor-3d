import { OrderStatus } from '@prisma/client'
import { prisma } from '../prisma/client'

export type SalesPeriod = '7d' | '30d' | '1y'

interface RawDailyRow {
  date: Date
  total: unknown
  orders: bigint
}

interface RawMonthlyRow {
  date: Date
  total: unknown
  orders: bigint
}

export interface SalesPoint {
  label: string
  date: string
  total: number
  orders: number
}

export async function getStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalSalesAgg, monthlyOrders, activeProducts, lowStockProducts] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: OrderStatus.PENDING } },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lt: 5 } } }),
  ])

  const totalSales = totalSalesAgg._sum.total ?? 0
  const generalTithe = totalSales * 0.1

  return {
    totalSales,
    monthlyOrders,
    activeProducts,
    lowStockProducts,
    generalTithe,
  }
}

function parseTotal(val: unknown): number {
  if (val === null || val === undefined) return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function formatDailyLabel(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
}

function formatMonthLabel(d: Date): string {
  return d.toLocaleDateString('es-AR', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function getSalesByPeriod(period: SalesPeriod): Promise<SalesPoint[]> {
  const now = new Date()

  if (period === '7d' || period === '30d') {
    const days = period === '7d' ? 7 : 30
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - days)

    const rows = await prisma.$queryRaw<RawDailyRow[]>`
      SELECT
        DATE(created_at AT TIME ZONE 'UTC') AS date,
        COALESCE(SUM(total), 0) AS total,
        COUNT(*)::bigint AS orders
      FROM orders
      WHERE status != 'PENDING'
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at AT TIME ZONE 'UTC')
      ORDER BY date ASC
    `

    const rowMap = new Map<string, { total: number; orders: number }>()
    for (const row of rows) {
      const key = toIsoDate(new Date(row.date))
      rowMap.set(key, { total: parseTotal(row.total), orders: Number(row.orders) })
    }

    const points: SalesPoint[] = []
    for (let i = days; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = toIsoDate(d)
      const entry = rowMap.get(key)
      points.push({
        label: formatDailyLabel(d),
        date: key,
        total: entry?.total ?? 0,
        orders: entry?.orders ?? 0,
      })
    }

    return points
  }

  const startDate = new Date(now)
  startDate.setFullYear(startDate.getFullYear() - 1)
  startDate.setDate(1)
  startDate.setHours(0, 0, 0, 0)

  const rows = await prisma.$queryRaw<RawMonthlyRow[]>`
    SELECT
      DATE_TRUNC('month', created_at AT TIME ZONE 'UTC') AS date,
      COALESCE(SUM(total), 0) AS total,
      COUNT(*)::bigint AS orders
    FROM orders
    WHERE status != 'PENDING'
      AND created_at >= ${startDate}
    GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'UTC')
    ORDER BY date ASC
  `

  const rowMap = new Map<string, { total: number; orders: number }>()
  for (const row of rows) {
    const d = new Date(row.date)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    rowMap.set(key, { total: parseTotal(row.total), orders: Number(row.orders) })
  }

  const points: SalesPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const entry = rowMap.get(key)
    points.push({
      label: formatMonthLabel(d),
      date: `${key}-01`,
      total: entry?.total ?? 0,
      orders: entry?.orders ?? 0,
    })
  }

  return points
}

export async function getRecentSales() {
  return prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      guestEmail: true,
      contactName: true,
      total: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
      user: {
        select: { id: true, email: true, name: true, lastName: true },
      },
    },
  })
}
