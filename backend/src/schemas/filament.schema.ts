import { z } from 'zod'

export const createFilamentSchema = z.object({
  brandName: z.string().min(2, 'Mínimo 2 caracteres'),
  material: z.string().min(1, 'Material requerido'),
  colorName: z.string().min(1, 'Color requerido'),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato hex inválido')
    .optional(),
  pricePerKg: z.number().positive('El precio debe ser positivo'),
  isActive: z.boolean().optional(),
  initialWeightGrams: z.number().min(0, 'No puede ser negativo').optional(),
  currentWeightGrams: z.number().min(0, 'No puede ser negativo').optional(),
  tareWeightGrams: z.number().min(0, 'No puede ser negativo').optional(),
})

export const updateFilamentSchema = createFilamentSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'El body no puede estar vacío',
  })

export const adjustFilamentSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('MANUAL'),
    currentWeightGrams: z.number().min(0, 'No puede ser negativo'),
    notes: z.string().optional(),
  }),
  z.object({
    mode: z.literal('SCALE'),
    grossWeightGrams: z.number().min(0, 'No puede ser negativo'),
    notes: z.string().optional(),
  }),
])

export type CreateFilamentInput = z.infer<typeof createFilamentSchema>
export type UpdateFilamentInput = z.infer<typeof updateFilamentSchema>
export type AdjustFilamentInput = z.infer<typeof adjustFilamentSchema>
