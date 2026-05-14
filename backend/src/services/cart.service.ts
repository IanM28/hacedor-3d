import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client'

const include = {
  items: {
    include: { product: { include: { category: true } } },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.CartInclude

interface OwnerParams {
  userId?: string
  sessionId?: string
}

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode })
}

function ensureOwner({ userId, sessionId }: OwnerParams): void {
  if (!userId && !sessionId) {
    throw httpError('Se requiere autenticación o header X-Session-Id', 400)
  }
}

async function getOrCreateCart({ userId, sessionId }: OwnerParams) {
  ensureOwner({ userId, sessionId })

  const existing = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include,
  })
  if (existing) return existing

  return prisma.cart.create({
    data: userId ? { userId } : { sessionId },
    include,
  })
}

export const cartService = {
  async getCart(params: OwnerParams) {
    return getOrCreateCart(params)
  },

  async addItem({
    userId,
    sessionId,
    productId,
    quantity,
  }: OwnerParams & { productId: string; quantity: number }) {
    const cart = await getOrCreateCart({ userId, sessionId })

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    })
    if (!product) throw httpError('Producto no encontrado', 404)
    if (product.stock === 0) throw httpError('Producto sin stock', 400)

    const existing = cart.items.find(i => i.productId === productId)
    const nextQuantity = (existing?.quantity ?? 0) + quantity

    if (nextQuantity > product.stock) {
      throw httpError(`Stock insuficiente. Disponible: ${product.stock}`, 400)
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      })
    }

    return prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include })
  },

  async updateItem({
    userId,
    sessionId,
    itemId,
    quantity,
  }: OwnerParams & { itemId: string; quantity: number }) {
    const cart = await getOrCreateCart({ userId, sessionId })

    const item = cart.items.find(i => i.id === itemId)
    if (!item) throw httpError('Item no encontrado en el carrito', 404)

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } })
      return prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include })
    }

    const product = await prisma.product.findFirst({
      where: { id: item.productId, isActive: true },
    })
    if (!product) throw httpError('Producto no encontrado', 404)
    if (quantity > product.stock) {
      throw httpError(`Stock insuficiente. Disponible: ${product.stock}`, 400)
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
    return prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include })
  },

  async removeItem({
    userId,
    sessionId,
    itemId,
  }: OwnerParams & { itemId: string }) {
    const cart = await getOrCreateCart({ userId, sessionId })

    const item = cart.items.find(i => i.id === itemId)
    if (!item) throw httpError('Item no encontrado en el carrito', 404)

    await prisma.cartItem.delete({ where: { id: itemId } })
    return prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include })
  },

  async clearCart(params: OwnerParams) {
    const cart = await getOrCreateCart(params)
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    return prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include })
  },
}
