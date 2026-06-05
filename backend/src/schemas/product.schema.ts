import { z } from 'zod'

const filamentUsageSchema = z.object({
  filamentId: z.string().uuid('filamentId debe ser un UUID válido'),
  grams: z.coerce.number().positive('Los gramos deben ser positivos'),
})

export const createProductSchema = z.object({
  code: z.string().trim().min(2, 'Código mínimo 2 caracteres'),
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  description: z.string().min(5, 'Descripción mínima 5 caracteres'),
  price: z.coerce.number().positive('El precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'El stock mínimo es 0'),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().uuid('categoryId debe ser un UUID válido'),
  supplierId: z.string().uuid('supplierId debe ser un UUID válido').optional(),
  supplierCost: z.coerce.number().positive().optional(),
  markupPercent: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  dimensionX: z.coerce.number().min(0).optional(),
  dimensionY: z.coerce.number().min(0).optional(),
  dimensionZ: z.coerce.number().min(0).optional(),
  printHours: z.coerce.number().min(0).optional(),
  filamentGrams: z.coerce.number().min(0).optional(),
  profitMultiplier: z.coerce.number().min(0).optional(),
  filamentUsages: z.array(filamentUsageSchema).optional(),
})

export const updateProductSchema = createProductSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'El body no puede estar vacío',
  })

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
