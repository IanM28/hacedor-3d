import { Router } from 'express'
import { authenticate, requireAdmin } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { createProductSchema, updateProductSchema } from '../schemas/product.schema'
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/product.controller'

const router = Router()

router.get('/', getProducts)
router.get('/:id', getProduct)
router.post('/', authenticate, requireAdmin, validate(createProductSchema), createProduct)
router.put('/:id', authenticate, requireAdmin, validate(updateProductSchema), updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
