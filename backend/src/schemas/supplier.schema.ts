import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  contactUrl: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const updateSupplierSchema = createSupplierSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'El body no puede estar vacío',
  })

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
