import { Router } from 'express'
import { getDashboardSales, getDashboardStats } from '../controllers/dashboard.controller'

const router = Router()

router.get('/stats', getDashboardStats)
router.get('/sales', getDashboardSales)

export default router
