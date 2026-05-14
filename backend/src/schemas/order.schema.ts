import { z } from 'zod'

export const orderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
])

export const paymentMethodEnum = z.enum(['MERCADOPAGO', 'TRANSFER', 'CASH'])

export const createOrderSchema = z.object({
  guestEmail: z.string().email('Email inválido').optional(),
  contactName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  address: z.string().min(5, 'Dirección mínima 5 caracteres'),
  phone: z.string().min(8, 'Teléfono mínimo 8 caracteres'),
  paymentMethod: paymentMethodEnum,
  shippingCost: z.number().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('productId debe ser un UUID válido'),
        quantity: z.number().int().min(1, 'La cantidad mínima es 1'),
      }),
    )
    .min(1, 'El pedido debe tener al menos un item'),
})

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
