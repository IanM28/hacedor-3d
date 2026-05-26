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

function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const categoryService = {
  async findAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  },

  async findAllAdmin() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  },

  async findById(id: string) {
    const category = await prisma.category.findFirst({ where: { id, isActive: true } })
    if (!category) throw notFound()
    return category
  },

  async create(data: CreateCategoryInput) {
    const slug = generateSlug(data.name)
    try {
      return await prisma.category.create({
        data: {
          name: data.name,
          slug,
          colorHex: data.colorHex ?? '#4A7C59',
          isActive: data.isActive ?? true,
        },
      })
    } catch (error) {
      if (isDuplicateSlug(error)) {
        throw Object.assign(new Error(`El slug "${slug}" ya existe`), { statusCode: 409 })
      }
      throw error
    }
  },

  async update(id: string, data: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) throw notFound()

    const updateData: Prisma.CategoryUpdateInput = {}
    if (data.name !== undefined) {
      updateData.name = data.name
      updateData.slug = generateSlug(data.name)
    }
    if (data.colorHex !== undefined) updateData.colorHex = data.colorHex
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    try {
      return await prisma.category.update({ where: { id }, data: updateData })
    } catch (error) {
      if (isDuplicateSlug(error)) {
        throw Object.assign(
          new Error(`El slug "${updateData.slug as string}" ya existe`),
          { statusCode: 409 },
        )
      }
      throw error
    }
  },

  async remove(id: string) {
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) throw notFound()
    await prisma.category.update({ where: { id }, data: { isActive: false } })
  },

  async toggleActive(id: string) {
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) throw notFound()
    return prisma.category.update({
      where: { id },
      data: { isActive: !existing.isActive },
    })
  },
}
