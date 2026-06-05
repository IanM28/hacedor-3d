import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { registerProductionSchema } from '../schemas/production.schema'
import { registerProduction } from '../controllers/production.controller'

const router = Router()

router.post('/register', validate(registerProductionSchema), registerProduction)

export default router
