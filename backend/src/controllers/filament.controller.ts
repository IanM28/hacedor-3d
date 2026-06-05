import type { NextFunction, Request, Response } from 'express'
import { filamentService } from '../services/filament.service'

export const getFilaments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN'
    const data = isAdmin
      ? await filamentService.findAllAdmin()
      : await filamentService.findAll()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const createFilament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await filamentService.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const updateFilament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await filamentService.update(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const deleteFilament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await filamentService.remove(req.params.id)
    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}

export const adjustFilament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await filamentService.adjust(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
