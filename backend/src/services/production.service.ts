import { prisma } from '../prisma/client'
import type { RegisterProductionInput } from '../schemas/production.schema'

export const productionService = {
  async registerProduction({ productId, quantity, notes }: RegisterProductionInput) {
    return prisma.$transaction(async tx => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          filamentUsages: {
            include: { filament: true },
          },
        },
      })

      if (!product) {
        throw Object.assign(new Error('Producto no encontrado'), { statusCode: 404 })
      }

      if (product.filamentUsages.length === 0) {
        throw Object.assign(
          new Error('El producto no tiene receta de materiales asignada'),
          { statusCode: 400 },
        )
      }

      for (const usage of product.filamentUsages) {
        const required = usage.grams * quantity
        if (usage.filament.currentWeightGrams < required) {
          throw Object.assign(
            new Error(
              `Filamento insuficiente: ${usage.filament.colorName} (${usage.filament.brandName} ${usage.filament.material}) — necesita ${required}g, disponible ${usage.filament.currentWeightGrams}g`,
            ),
            { statusCode: 400 },
          )
        }
      }

      const logs = []

      for (const usage of product.filamentUsages) {
        const required = usage.grams * quantity
        const previousWeightGrams = usage.filament.currentWeightGrams
        const newWeightGrams = previousWeightGrams - required

        await tx.filament.update({
          where: { id: usage.filamentId },
          data: { currentWeightGrams: { decrement: required } },
        })

        logs.push(
          tx.filamentLog.create({
            data: {
              filamentId: usage.filamentId,
              productId,
              type: 'PRODUCTION_CONSUMPTION',
              gramsDelta: -required,
              previousWeightGrams,
              newWeightGrams,
              quantity,
              notes: notes ?? null,
            },
          }),
        )
      }

      await Promise.all(logs)

      return { productId, quantity, consumptions: product.filamentUsages.length }
    })
  },
}
