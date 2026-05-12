import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client'
import type { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema'

function notFound(): Error {
  return Object.assign(new Error('Categoría no encontrada'), { statusCode: 404 })
}

function isDuplicateSlug(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray((error.meta as { target?: string[] } | undefined)?.target) &&
    ((error.meta as { target?: string[] }).target ?? []).includes('slug')
  )
}

export const categoryService = {
  async findAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  },

  async findById(id: string) {
    const category = await prisma.category.findFirst({ where: { id, isActive: true } })
    if (!category) throw notFound()
    return category
  },

  async create(data: CreateCategoryInput) {
    try {
      return await prisma.category.create({ data })
    } catch (error) {
      if (isDuplicateSlug(error)) {
        throw Object.assign(new Error(`El slug "${data.slug}" ya existe`), { statusCode: 409 })
      }
      throw error
    }
  },

  async update(id: string, data: UpdateCategoryInput) {
    await categoryService.findById(id)
    return prisma.category.update({ where: { id }, data })
  },

  async remove(id: string) {
    await categoryService.findById(id)
    await prisma.category.update({ where: { id }, data: { isActive: false } })
  },
}
