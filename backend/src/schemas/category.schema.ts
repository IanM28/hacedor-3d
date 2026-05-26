import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color HEX inválido')
    .optional(),
  isActive: z.boolean().optional(),
})

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'El body no puede estar vacío',
  })

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
