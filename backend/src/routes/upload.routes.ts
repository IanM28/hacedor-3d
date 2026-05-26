import { Router } from 'express'
import { authenticate, requireAdmin } from '../middlewares/auth'
import { uploadProductImage } from '../middlewares/upload'
import { uploadProductImageHandler } from '../controllers/upload.controller'

const router = Router()

router.post('/product-images', authenticate, requireAdmin, uploadProductImage, uploadProductImageHandler)

export default router
