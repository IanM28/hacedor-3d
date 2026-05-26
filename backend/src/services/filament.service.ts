import { prisma } from '../prisma/client'
import type { CreateFilamentInput, UpdateFilamentInput } from '../schemas/filament.schema'

function notFound(): Error {
  return Object.assign(new Error('Filamento no encontrado'), { statusCode: 404 })
}

export const filamentService = {
  async findAll() {
    return prisma.filament.findMany({
      where: { isActive: true },
      orderBy: [{ brandName: 'asc' }, { material: 'asc' }],
    })
  },

  async findAllAdmin() {
    return prisma.filament.findMany({
      orderBy: [{ brandName: 'asc' }, { material: 'asc' }],
    })
  },

  async findById(id: string) {
    const filament = await prisma.filament.findUnique({ where: { id } })
    if (!filament) throw notFound()
    return filament
  },

  async create(data: CreateFilamentInput) {
    return prisma.filament.create({ data })
  },

  async update(id: string, data: UpdateFilamentInput) {
    const existing = await prisma.filament.findUnique({ where: { id } })
    if (!existing) throw notFound()
    return prisma.filament.update({ where: { id }, data })
  },

  async remove(id: string) {
    const existing = await prisma.filament.findUnique({ where: { id } })
    if (!existing) throw notFound()
    return prisma.filament.update({ where: { id }, data: { isActive: false } })
  },
}
