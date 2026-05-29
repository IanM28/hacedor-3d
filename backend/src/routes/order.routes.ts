import { Router } from 'express'
import { authenticate, authOptional, requireAdmin } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import {
  createOrderSchema,
  updateOrderStatusSchema,
  adminListOrdersSchema,
  adminUpdateOrderStatusSchema,
} from '../schemas/order.schema'
import {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  adminGetOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
} from '../controllers/order.controller'

const router = Router()

// Admin routes — must be registered before /:id to avoid conflicts
router.get('/admin', authenticate, requireAdmin, validate(adminListOrdersSchema, 'query'), adminGetOrders)
router.get('/admin/:id', authenticate, requireAdmin, adminGetOrder)
router.patch(
  '/admin/:id/status',
  authenticate,
  requireAdmin,
  validate(adminUpdateOrderStatusSchema),
  adminUpdateOrderStatus,
)

// Client routes
router.post('/', authOptional, validate(createOrderSchema), createOrder)
router.get('/', authenticate, getOrders)
router.get('/:id', authenticate, getOrder)
router.put(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(updateOrderStatusSchema),
  updateOrderStatus,
)

export default router
