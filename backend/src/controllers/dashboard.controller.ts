import type { NextFunction, Request, Response } from 'express'
import { getRecentSales, getSalesByPeriod, getStats } from '../services/dashboard.service'
import type { SalesPeriod } from '../services/dashboard.service'

const VALID_PERIODS: SalesPeriod[] = ['7d', '30d', '1y']

function isValidPeriod(value: unknown): value is SalesPeriod {
  return typeof value === 'string' && (VALID_PERIODS as string[]).includes(value)
}

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getStats()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getDashboardSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawPeriod = req.query['period']
    const period: SalesPeriod = isValidPeriod(rawPeriod) ? rawPeriod : '30d'
    const data = await getSalesByPeriod(period)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const getDashboardRecentSales = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getRecentSales()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
