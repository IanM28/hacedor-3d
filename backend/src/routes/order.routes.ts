import { Router } from 'express'
import { authenticate, authOptional, requireAdmin } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema'
import {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
} from '../controllers/order.controller'

const router = Router()

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
