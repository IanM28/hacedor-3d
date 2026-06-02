import { z } from 'zod'

export const shippingQuoteSchema = z.object({
  postalCode: z.string().min(4, 'Código postal inválido').max(8, 'Código postal inválido'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('productId debe ser un UUID válido'),
        quantity: z.number().int().min(1, 'La cantidad mínima es 1'),
      }),
    )
    .min(1, 'Se requiere al menos un producto'),
})

export const shippingLabelSchema = z.object({
  orderId: z.string().uuid('orderId debe ser un UUID válido'),
  quoteId: z.string().min(1, 'quoteId es requerido'),
})

export type ShippingQuoteInput = z.infer<typeof shippingQuoteSchema>
export type ShippingLabelInput = z.infer<typeof shippingLabelSchema>

export interface NormalizedShippingOption {
  id: string
  provider: string
  service: string
  price: number
  estimatedDelivery: string
}
