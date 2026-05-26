import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { createSupplierSchema, updateSupplierSchema } from '../schemas/supplier.schema'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '../controllers/supplier.controller'

const router = Router()

router.get('/', getSuppliers)
router.post('/', validate(createSupplierSchema), createSupplier)
router.put('/:id', validate(updateSupplierSchema), updateSupplier)
router.delete('/:id', deleteSupplier)

export default router
