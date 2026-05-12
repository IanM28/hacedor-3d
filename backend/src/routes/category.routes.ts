import { Router } from 'express'
import { authenticate, requireAdmin } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers/category.controller'

const router = Router()

router.get('/', getCategories)
router.get('/:id', getCategory)
router.post('/', authenticate, requireAdmin, validate(createCategorySchema), createCategory)
router.put('/:id', authenticate, requireAdmin, validate(updateCategorySchema), updateCategory)
router.delete('/:id', authenticate, requireAdmin, deleteCategory)

export default router
