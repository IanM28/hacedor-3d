import { prisma } from '../prisma/client'
import type { AdjustFilamentInput, CreateFilamentInput, UpdateFilamentInput } from '../schemas/filament.schema'

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

  async adjust(id: string, input: AdjustFilamentInput) {
    return prisma.$transaction(async tx => {
      const filament = await tx.filament.findUnique({ where: { id } })
      if (!filament) throw notFound()

      const previousWeightGrams = filament.currentWeightGrams
      let newWeightGrams: number
      let grossWeightGrams: number | undefined
      let tareWeightGrams: number | undefined

      if (input.mode === 'SCALE') {
        const net = Math.max(0, input.grossWeightGrams - filament.tareWeightGrams)
        newWeightGrams = net
        grossWeightGrams = input.grossWeightGrams
        tareWeightGrams = filament.tareWeightGrams
      } else {
        newWeightGrams = input.currentWeightGrams
      }

      const gramsDelta = newWeightGrams - previousWeightGrams

      const updated = await tx.filament.update({
        where: { id },
        data: { currentWeightGrams: newWeightGrams },
      })

      await tx.filamentLog.create({
        data: {
          filamentId: id,
          type: input.mode === 'SCALE' ? 'SCALE_WEIGHING' : 'MANUAL_ADJUSTMENT',
          gramsDelta,
          previousWeightGrams,
          newWeightGrams,
          grossWeightGrams: grossWeightGrams ?? null,
          tareWeightGrams: tareWeightGrams ?? null,
          notes: input.notes ?? null,
        },
      })

      return updated
    })
  },
}
