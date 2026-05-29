import { Router } from 'express'
import { getDashboardRecentSales, getDashboardSales, getDashboardStats } from '../controllers/dashboard.controller'

const router = Router()

router.get('/stats', getDashboardStats)
router.get('/sales', getDashboardSales)
router.get('/recent-sales', getDashboardRecentSales)

export default router
