import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client'
import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema'

const include = {
  category: true,
  supplier: true,
  filamentUsages: { include: { filament: true } },
} satisfies Prisma.ProductInclude

interface ProductFilters {
  category?: string
  search?: string
  featured?: string
  code?: string
  includeInactive?: boolean
}

function notFound(): Error {
  return Object.assign(new Error('Producto no encontrado'), { statusCode: 404 })
}

function isDuplicateCode(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray((error.meta as { target?: string[] } | undefined)?.target) &&
    ((error.meta as { target?: string[] }).target ?? []).includes('code')
  )
}

export const productService = {
  async findAll({ category, search, featured, code, includeInactive }: ProductFilters) {
    return prisma.product.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(category && { category: { slug: category } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }),
        ...(featured !== undefined && { isFeatured: featured === 'true' }),
        ...(code && { code }),
      },
      include,
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
      include,
    })
    if (!product) throw notFound()
    return product
  },

  async create(data: CreateProductInput) {
    const { filamentUsages, ...productData } = data
    try {
      return await prisma.product.create({
        data: {
          ...productData,
          ...(filamentUsages && filamentUsages.length > 0 && {
            filamentUsages: {
              create: filamentUsages.map(u => ({
                filamentId: u.filamentId,
                grams: u.grams,
              })),
            },
          }),
        },
        include,
      })
    } catch (error) {
      if (isDuplicateCode(error)) {
        throw Object.assign(new Error(`El código ${data.code} ya existe`), { statusCode: 409 })
      }
      throw error
    }
  },

  async update(id: string, data: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) throw notFound()

    const {
      filamentUsages,
      code,
      name,
      description,
      price,
      stock,
      images,
      isActive,
      isFeatured,
      categoryId,
      supplierId,
      supplierCost,
      markupPercent,
      weight,
      dimensionX,
      dimensionY,
      dimensionZ,
      printHours,
      filamentGrams,
      profitMultiplier,
    } = data

    // Build only the scalar fields that were actually sent (undefined means "don't touch")
    const scalarUpdate = {
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(images !== undefined && { images }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(categoryId !== undefined && { categoryId }),
      ...(supplierId !== undefined && { supplierId }),
      ...(supplierCost !== undefined && { supplierCost }),
      ...(markupPercent !== undefined && { markupPercent }),
      ...(weight !== undefined && { weight }),
      ...(dimensionX !== undefined && { dimensionX }),
      ...(dimensionY !== undefined && { dimensionY }),
      ...(dimensionZ !== undefined && { dimensionZ }),
      ...(printHours !== undefined && { printHours }),
      ...(filamentGrams !== undefined && { filamentGrams }),
      ...(profitMultiplier !== undefined && { profitMultiplier }),
    }

    return prisma.$transaction(async tx => {
      if (filamentUsages !== undefined) {
        await tx.productFilamentUsage.deleteMany({ where: { productId: id } })
        if (filamentUsages.length > 0) {
          await tx.productFilamentUsage.createMany({
            data: filamentUsages.map(u => ({
              productId: id,
              filamentId: u.filamentId,
              grams: Number(u.grams),
            })),
          })
        }
      }

      return tx.product.update({
        where: { id },
        data: scalarUpdate,
        include,
      })
    })
  },

  async remove(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) throw notFound()
    await prisma.product.update({ where: { id }, data: { isActive: false } })
  },
}
