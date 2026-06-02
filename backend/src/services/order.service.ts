import { Prisma, type OrderStatus, type PaymentMethod } from '@prisma/client'
import { prisma } from '../prisma/client'

const include = {
  items: { include: { product: true } },
  user: { select: { id: true, email: true, name: true, lastName: true } },
} satisfies Prisma.OrderInclude

const adminInclude = {
  user: { select: { id: true, email: true, name: true, lastName: true } },
  items: {
    include: {
      product: {
        select: {
          id: true,
          code: true,
          name: true,
          images: true,
          price: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude

const STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  IN_PRODUCTION: 2,
  PREPARING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
}

const VALID_NEXT: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'IN_PRODUCTION',
  IN_PRODUCTION: 'PREPARING',
  PREPARING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

interface CreateOrderParams {
  userId?: string
  guestEmail?: string
  contactName: string
  address: string
  phone: string
  paymentMethod: PaymentMethod
  shippingCost?: number
  shippingProvider?: string
  shippingService?: string
  shippingPostalCode?: string
  items: { productId: string; quantity: number }[]
}

interface ListParams {
  userId?: string
  role?: 'CLIENT' | 'ADMIN'
}

interface FindOneParams extends ListParams {
  id: string
}

interface AdminListParams {
  status?: OrderStatus
  page: number
  limit: number
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
    shippingProvider,
    shippingService,
    shippingPostalCode,
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
          shippingProvider,
          shippingService,
          shippingPostalCode,
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

  async findAllAdmin({ status, page, limit }: AdminListParams) {
    const where: Prisma.OrderWhereInput = status ? { status } : {}
    const skip = (page - 1) * limit

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: adminInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async findAdminById(id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: adminInclude })
    if (!order) throw httpError('Pedido no encontrado', 404)
    return order
  },

  async updateAdminStatus({ id, status }: { id: string; status: OrderStatus }) {
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) throw httpError('Pedido no encontrado', 404)

    const currentRank = STATUS_RANK[order.status as string]
    const newRank = STATUS_RANK[status as string]

    if (currentRank === undefined || newRank === undefined) {
      throw httpError('Estado inválido', 400)
    }

    if (order.status === status) {
      return prisma.order.findUnique({ where: { id }, include: adminInclude })
    }

    const expectedNext = VALID_NEXT[order.status as string]
    if (expectedNext !== status) {
      throw httpError(
        `Transición inválida: no se puede pasar de ${order.status} a ${status}. Siguiente estado válido: ${expectedNext ?? 'ninguno'}`,
        400,
      )
    }

    return prisma.order.update({ where: { id }, data: { status }, include: adminInclude })
  },
}
