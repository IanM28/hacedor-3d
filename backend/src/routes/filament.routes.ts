import { Router } from 'express'
import { authenticate, authOptional, requireAdmin } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { adjustFilamentSchema, createFilamentSchema, updateFilamentSchema } from '../schemas/filament.schema'
import {
  adjustFilament,
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
router.patch('/:id/adjust', authenticate, requireAdmin, validate(adjustFilamentSchema), adjustFilament)

export default router
