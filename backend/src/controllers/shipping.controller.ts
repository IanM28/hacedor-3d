import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { shippingService } from '../services/shipping.service'
import type { ShippingQuoteInput, ShippingLabelInput } from '../schemas/shipping.schema'

export const shippingController = {
  async quote(req: Request, res: Response, next: NextFunction) {
    try {
      const { postalCode, items } = req.body as ShippingQuoteInput

      const productIds = items.map(i => i.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true, weight: true, code: true },
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

      const options = await shippingService.quote(postalCode, totalWeightGrams)

      res.json({ success: true, data: { options, totalWeightGrams } })
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
        data: {
          orderId: updated.id,
          trackingNumber,
          labelUrl,
        },
      })
    } catch (error) {
      next(error)
    }
  },
}
