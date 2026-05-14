import { z } from 'zod'

export const addCartItemSchema = z.object({
  productId: z.string().uuid('productId debe ser un UUID válido'),
  quantity: z.number().int().min(1, 'La cantidad mínima es 1'),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'La cantidad mínima es 0'),
})

export type AddCartItemInput = z.infer<typeof addCartItemSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
