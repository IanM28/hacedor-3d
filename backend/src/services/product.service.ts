import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client'
import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema'

const include = { category: true, supplier: true } satisfies Prisma.ProductInclude

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
    try {
      return await prisma.product.create({ data, include })
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
    return prisma.product.update({ where: { id }, data, include })
  },

  async remove(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) throw notFound()
    await prisma.product.update({ where: { id }, data: { isActive: false } })
  },
}
