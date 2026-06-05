import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { shippingService } from '../services/shipping.service'
import type { ShippingQuoteInput, ShippingLabelInput } from '../schemas/shipping.schema'

const DIM_FALLBACK_MM = 50
const BOX_MIN_MM = 150

interface CartProduct {
  id: string
  weight: number
  dimensionX: number | null
  dimensionY: number | null
  dimensionZ: number | null
}

interface CartItem {
  productId: string
  quantity: number
}

function computeBoxCm(products: CartProduct[], items: CartItem[]): {
  largo: number
  ancho: number
  alto: number
} {
  let maxY = BOX_MIN_MM
  let maxX = BOX_MIN_MM
  let accZ = 0

  for (const item of items) {
    const p = products.find(pr => pr.id === item.productId)
    const x = p?.dimensionX ?? DIM_FALLBACK_MM
    const y = p?.dimensionY ?? DIM_FALLBACK_MM
    const z = p?.dimensionZ ?? DIM_FALLBACK_MM

    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    accZ += z * item.quantity
  }

  const altoMm = Math.max(BOX_MIN_MM, accZ)

  return {
    largo: Math.ceil(maxY / 10),
    ancho: Math.ceil(maxX / 10),
    alto: Math.ceil(altoMm / 10),
  }
}

export const shippingController = {
  async quote(req: Request, res: Response, next: NextFunction) {
    try {
      const { postalCode, items } = req.body as ShippingQuoteInput

      const productIds = items.map(i => i.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: {
          id: true,
          weight: true,
          code: true,
          dimensionX: true,
          dimensionY: true,
          dimensionZ: true,
        },
      })

      if (products.length !== productIds.length) {
        res.status(404).json({
          success: false,
          error: 'Alguno de los productos no existe o no está disponible',
        })
        return
      }

      const totalWeightGrams = items.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId)
        return acc + (product?.weight ?? 0) * item.quantity
      }, 0)

      if (totalWeightGrams <= 0) {
        res.status(400).json({
          success: false,
          error:
            'El peso total de los productos es 0. Actualizá el peso de los productos en el panel admin.',
        })
        return
      }

      const box = computeBoxCm(products, items)
      const options = await shippingService.quote(postalCode, totalWeightGrams, box)

      res.json({ success: true, data: { options, totalWeightGrams, box } })
    } catch (error) {
      next(error)
    }
  },

  async generateLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, quoteId } = req.body as ShippingLabelInput

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, status: true },
      })

      if (!order) {
        res.status(404).json({ success: false, error: 'Pedido no encontrado' })
        return
      }

      const { trackingNumber, labelUrl } = await shippingService.generateLabel(orderId, quoteId)

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { shippingTrackingNumber: trackingNumber, shippingLabelUrl: labelUrl },
      })

      res.json({
        success: true,
        data: { orderId: updated.id, trackingNumber, labelUrl },
      })
    } catch (error) {
      next(error)
    }
  },
}
