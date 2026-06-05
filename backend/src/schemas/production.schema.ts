import { z } from 'zod'

export const registerProductionSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  notes: z.string().optional(),
})

export type RegisterProductionInput = z.infer<typeof registerProductionSchema>
