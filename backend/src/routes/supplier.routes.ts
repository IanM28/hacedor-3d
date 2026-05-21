import { Router } from 'express'
import { getSuppliers } from '../controllers/supplier.controller'

const router = Router()

router.get('/', getSuppliers)

export default router
