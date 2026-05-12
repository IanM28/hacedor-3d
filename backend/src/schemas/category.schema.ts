import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  slug: z
    .string()
    .min(2, 'Slug mínimo 2 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe ser lowercase/kebab-case'),
  description: z.string().optional(),
})

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'El body no puede estar vacío',
  })

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
