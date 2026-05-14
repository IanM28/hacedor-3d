import type { NextFunction, Request, Response } from 'express'
import { cartService } from '../services/cart.service'

function getOwner(req: Request) {
  const userId = req.user?.userId
  const sessionHeader = req.header('X-Session-Id')
  const sessionId = typeof sessionHeader === 'string' && sessionHeader.length > 0
    ? sessionHeader
    : undefined
  return { userId, sessionId }
}

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await cartService.getCart(getOwner(req))
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const addCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body as { productId: string; quantity: number }
    const data = await cartService.addItem({ ...getOwner(req), productId, quantity })
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body as { quantity: number }
    const data = await cartService.updateItem({
      ...getOwner(req),
      itemId: req.params.id,
      quantity,
    })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await cartService.removeItem({ ...getOwner(req), itemId: req.params.id })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await cartService.clearCart(getOwner(req))
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
