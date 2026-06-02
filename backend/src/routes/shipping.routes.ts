import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { authenticate, requireAdmin } from '../middlewares/auth'
import { shippingController } from '../controllers/shipping.controller'
import { shippingQuoteSchema, shippingLabelSchema } from '../schemas/shipping.schema'

const router = Router()

router.post('/quote', validate(shippingQuoteSchema), shippingController.quote)

router.post(
  '/label',
  authenticate,
  requireAdmin,
  validate(shippingLabelSchema),
  shippingController.generateLabel,
)

export default router
