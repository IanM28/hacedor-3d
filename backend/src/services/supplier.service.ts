import { prisma } from '../prisma/client'

export const supplierService = {
  async findAll() {
    return prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  },
}
