import type { NextFunction, Request, Response } from 'express'
import { supplierService } from '../services/supplier.service'

export const getSuppliers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await supplierService.findAll()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
