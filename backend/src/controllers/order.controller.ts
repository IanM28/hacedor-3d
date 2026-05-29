import type { NextFunction, Request, Response } from 'express'
import { orderService } from '../services/order.service'
import type {
  AdminListOrdersInput,
  AdminUpdateOrderStatusInput,
  CreateOrderInput,
  UpdateOrderStatusInput,
} from '../schemas/order.schema'
import type { OrderStatus } from '@prisma/client'

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

export const adminGetOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as AdminListOrdersInput
    const data = await orderService.findAllAdmin({
      status: query.status as OrderStatus | undefined,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const adminGetOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.findAdminById(req.params.id)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const adminUpdateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as AdminUpdateOrderStatusInput
    const data = await orderService.updateAdminStatus({ id: req.params.id, status })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
