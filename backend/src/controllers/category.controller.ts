import type { NextFunction, Request, Response } from 'express'
import { categoryService } from '../services/category.service'

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await categoryService.findAll()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await categoryService.findById(req.params.id)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await categoryService.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await categoryService.update(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.remove(req.params.id)
    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
