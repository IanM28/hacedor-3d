import type { NextFunction, Request, Response } from 'express'
import { supplierService } from '../services/supplier.service'

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const data = includeInactive
      ? await supplierService.findAllAdmin()
      : await supplierService.findAll()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await supplierService.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await supplierService.update(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await supplierService.remove(req.params.id)
    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
