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
})

export const updateFilamentSchema = createFilamentSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'El body no puede estar vacío',
  })

export type CreateFilamentInput = z.infer<typeof createFilamentSchema>
export type UpdateFilamentInput = z.infer<typeof updateFilamentSchema>
