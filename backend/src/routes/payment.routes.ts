import { Router } from 'express'
import { authOptional } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { createPreferenceSchema } from '../schemas/payment.schema'
import {
  createPreference,
  getStatus,
  webhook,
} from '../controllers/payment.controller'

const router = Router()

router.post(
  '/create-preference',
  authOptional,
  validate(createPreferenceSchema),
  createPreference,
)
router.post('/webhook', webhook)
router.get('/status/:paymentId', getStatus)

export default router
