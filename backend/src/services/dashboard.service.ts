import { OrderStatus } from '@prisma/client'
import { prisma } from '../prisma/client'
import { calculateOrderProfit } from './costing.service'

const COMPLETED_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

export async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalClients, activeProducts, completedOrders, monthlySalesAgg, totalAmountAgg] =
    await Promise.all([
      prisma.user.count({ where: { role: 'CLIENT', isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({
        where: { status: { in: COMPLETED_STATUSES } },
        select: {
          items: {
            select: {
              unitPrice: true,
              quantity: true,
              product: {
                select: {
                  printHours: true,
                  filamentGrams: true,
                  profitMultiplier: true,
                  supplierCost: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: COMPLETED_STATUSES },
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: { in: COMPLETED_STATUSES } },
        _sum: { total: true },
      }),
    ])

  let netProfit = 0
  let titheAmount = 0
  let isProfitEstimated = false

  for (const order of completedOrders) {
    const result = calculateOrderProfit({ items: order.items })
    netProfit += result.netProfit
    titheAmount += result.titheAmount
    if (result.isEstimated) isProfitEstimated = true
  }

  return {
    totalClients,
    activeProducts,
    monthlySales: monthlySalesAgg._sum.total ?? 0,
    totalAmount: totalAmountAgg._sum.total ?? 0,
    netProfit,
    titheAmount,
    isProfitEstimated,
  }
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
