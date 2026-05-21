import { z } from 'zod'

export const createProductSchema = z.object({
  code: z
    .string()
    .regex(/^[A-Z]+-\d{2}$/, 'Formato inválido. Ejemplo: AERO-01'),
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  description: z.string().min(5, 'Descripción mínima 5 caracteres'),
  price: z.number().positive('El precio debe ser positivo'),
  stock: z.number().int().min(0, 'El stock mínimo es 0'),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().uuid('categoryId debe ser un UUID válido'),
  supplierId: z.string().uuid('supplierId debe ser un UUID válido'),
  supplierCost: z.number().positive().optional(),
  markupPercent: z.number().min(0).optional(),
  printHours: z.number().min(0).optional(),
  filamentGrams: z.number().min(0).optional(),
  profitMultiplier: z.number().min(0).optional(),
})

export const updateProductSchema = createProductSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'El body no puede estar vacío',
  })

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
