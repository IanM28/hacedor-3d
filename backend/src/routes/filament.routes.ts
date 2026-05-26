import { Router } from 'express'
import { authenticate, authOptional, requireAdmin } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { createFilamentSchema, updateFilamentSchema } from '../schemas/filament.schema'
import {
  createFilament,
  deleteFilament,
  getFilaments,
  updateFilament,
} from '../controllers/filament.controller'

const router = Router()

router.get('/', authOptional, getFilaments)
router.post('/', authenticate, requireAdmin, validate(createFilamentSchema), createFilament)
router.put('/:id', authenticate, requireAdmin, validate(updateFilamentSchema), updateFilament)
router.delete('/:id', authenticate, requireAdmin, deleteFilament)

export default router
