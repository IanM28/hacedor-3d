import type { NextFunction, Request, Response } from 'express'
import { mercadopagoService } from '../services/mercadopago.service'
import type { CreatePreferenceInput } from '../schemas/payment.schema'

export const createPreference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, guestEmail } = req.body as CreatePreferenceInput
    const data = await mercadopagoService.createPreferenceForOrder({
      orderId,
      userId: req.user?.userId,
      role: req.user?.role,
      guestEmail,
    })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

function getHeader(req: Request, name: string): string | undefined {
  const value = req.header(name)
  return typeof value === 'string' ? value : undefined
}

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await mercadopagoService.handleWebhook({
      headers: {
        xSignature: getHeader(req, 'x-signature'),
        xRequestId: getHeader(req, 'x-request-id'),
      },
      body: req.body,
      query: req.query as Record<string, unknown>,
    })
    res.status(200).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await mercadopagoService.getPaymentStatus(req.params.paymentId)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
