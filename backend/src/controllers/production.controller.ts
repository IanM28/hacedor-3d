import type { NextFunction, Request, Response } from 'express'
import { productionService } from '../services/production.service'

export const registerProduction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productionService.registerProduction(req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
