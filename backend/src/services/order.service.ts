import { Prisma, type OrderStatus, type PaymentMethod } from '@prisma/client'
import { prisma } from '../prisma/client'

const include = {
  items: { include: { product: true } },
  user: { select: { id: true, email: true, name: true, lastName: true } },
} satisfies Prisma.OrderInclude

interface CreateOrderParams {
  userId?: string
  guestEmail?: string
  contactName: string
  address: string
  phone: string
  paymentMethod: PaymentMethod
  shippingCost?: number
  items: { productId: string; quantity: number }[]
}

interface ListParams {
  userId?: string
  role?: 'CLIENT' | 'ADMIN'
}

interface FindOneParams extends ListParams {
  id: string
}

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode })
}

export const orderService = {
  async create({
    userId,
    guestEmail,
    contactName,
    address,
    phone,
    paymentMethod,
    shippingCost = 0,
    items,
  }: CreateOrderParams) {
    if (!userId && !guestEmail) {
      throw httpError('Se requiere userId o guestEmail para crear el pedido', 400)
    }

    return prisma.$transaction(async tx => {
      const productIds = items.map(i => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      })

      if (products.length !== productIds.length) {
        throw httpError('Alguno de los productos no existe o no está disponible', 404)
      }

      const productMap = new Map(products.map(p => [p.id, p]))

      for (const item of items) {
        const product = productMap.get(item.productId)
        if (!product) throw httpError(`Producto ${item.productId} no encontrado`, 404)
        if (product.stock < item.quantity) {
          throw httpError(
            `Stock insuficiente para ${product.code}. Disponible: ${product.stock}`,
            400,
          )
        }
      }

      const subtotal = items.reduce((acc, item) => {
        const product = productMap.get(item.productId)
        if (!product) return acc
        return acc + product.price * item.quantity
      }, 0)
      const total = subtotal + shippingCost

      const order = await tx.order.create({
        data: {
          userId,
          guestEmail,
          contactName,
          address,
          phone,
          paymentMethod,
          shippingCost,
          total,
          items: {
            create: items.map(item => {
              const product = productMap.get(item.productId)
              if (!product) throw httpError('Producto no disponible', 404)
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
              }
            }),
          },
        },
        include,
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return order
    })
  },

  async findAll({ userId, role }: ListParams) {
    if (role !== 'ADMIN' && !userId) {
      throw httpError('No autorizado', 401)
    }

    return prisma.order.findMany({
      where: role === 'ADMIN' ? {} : { userId },
      include,
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById({ id, userId, role }: FindOneParams) {
    const order = await prisma.order.findUnique({ where: { id }, include })
    if (!order) throw httpError('Pedido no encontrado', 404)

    if (role !== 'ADMIN' && order.userId !== userId) {
      throw httpError('Pedido no encontrado', 404)
    }

    return order
  },

  async updateStatus({ id, status }: { id: string; status: OrderStatus }) {
    const exists = await prisma.order.findUnique({ where: { id } })
    if (!exists) throw httpError('Pedido no encontrado', 404)

    return prisma.order.update({ where: { id }, data: { status }, include })
  },
}
