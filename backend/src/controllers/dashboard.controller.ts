import type { NextFunction, Request, Response } from 'express'
import { getRecentSales, getStats } from '../services/dashboard.service'

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getStats()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getDashboardSales = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getRecentSales()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
