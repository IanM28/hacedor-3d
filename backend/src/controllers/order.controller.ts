import type { NextFunction, Request, Response } from 'express'
import { orderService } from '../services/order.service'
import type { CreateOrderInput, UpdateOrderStatusInput } from '../schemas/order.schema'

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CreateOrderInput
    const data = await orderService.create({
      ...body,
      userId: req.user?.userId,
    })
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.findAll({
      userId: req.user?.userId,
      role: req.user?.role,
    })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.findById({
      id: req.params.id,
      userId: req.user?.userId,
      role: req.user?.role,
    })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as UpdateOrderStatusInput
    const data = await orderService.updateStatus({ id: req.params.id, status })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
