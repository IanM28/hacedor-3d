import type { NextFunction, Request, Response } from 'express'
import { productService } from '../services/product.service'

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, featured, code, includeInactive } = req.query
    const isAdmin = req.user?.role === 'ADMIN'
    const data = await productService.findAll({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      featured: typeof featured === 'string' ? featured : undefined,
      code: typeof code === 'string' ? code : undefined,
      includeInactive: isAdmin && includeInactive === 'true',
    })
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productService.findById(req.params.id)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productService.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productService.update(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.remove(req.params.id)
    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
