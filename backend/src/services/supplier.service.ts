import { prisma } from '../prisma/client'
import type { CreateSupplierInput, UpdateSupplierInput } from '../schemas/supplier.schema'

function notFound(): Error {
  return Object.assign(new Error('Proveedor no encontrado'), { statusCode: 404 })
}

export const supplierService = {
  async findAll() {
    return prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, contactUrl: true, isActive: true },
    })
  },

  async findAllAdmin() {
    return prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, contactUrl: true, isActive: true },
    })
  },

  async findById(id: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } })
    if (!supplier) throw notFound()
    return supplier
  },

  async create(data: CreateSupplierInput) {
    return prisma.supplier.create({
      data: {
        name: data.name,
        contactUrl: data.contactUrl ?? null,
        isActive: data.isActive ?? true,
      },
      select: { id: true, name: true, contactUrl: true, isActive: true },
    })
  },

  async update(id: string, data: UpdateSupplierInput) {
    const existing = await prisma.supplier.findUnique({ where: { id } })
    if (!existing) throw notFound()

    return prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.contactUrl !== undefined && { contactUrl: data.contactUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: { id: true, name: true, contactUrl: true, isActive: true },
    })
  },

  async remove(id: string) {
    const existing = await prisma.supplier.findUnique({ where: { id } })
    if (!existing) throw notFound()
    await prisma.supplier.update({ where: { id }, data: { isActive: false } })
  },

  async toggleActive(id: string) {
    const existing = await prisma.supplier.findUnique({ where: { id } })
    if (!existing) throw notFound()
    return prisma.supplier.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: { id: true, name: true, contactUrl: true, isActive: true },
    })
  },
}
