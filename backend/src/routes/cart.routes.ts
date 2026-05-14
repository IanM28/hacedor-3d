import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { addCartItemSchema, updateCartItemSchema } from '../schemas/cart.schema'
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cart.controller'

const router = Router()

router.get('/', getCart)
router.post('/items', validate(addCartItemSchema), addCartItem)
router.put('/items/:id', validate(updateCartItemSchema), updateCartItem)
router.delete('/items/:id', removeCartItem)
router.delete('/', clearCart)

export default router
