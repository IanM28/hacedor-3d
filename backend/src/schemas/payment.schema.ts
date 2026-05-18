import { z } from 'zod'

export const createPreferenceSchema = z.object({
  orderId: z.string().uuid('orderId debe ser un UUID válido'),
  guestEmail: z.string().email('Email inválido').optional(),
})

export type CreatePreferenceInput = z.infer<typeof createPreferenceSchema>
