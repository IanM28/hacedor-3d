import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_FILAMENT_VALUE_PER_GRAM = 20 // $20.000/kg / 1000

async function main() {
  const products = await prisma.product.findMany({
    where: { weight: { lte: 0 } },
    select: { id: true, code: true, price: true, weight: true },
  })

  if (products.length === 0) {
    console.log('No hay productos con weight <= 0. Nada que actualizar.')
    return
  }

  console.log(`Actualizando ${products.length} producto(s)...`)

  for (const product of products) {
    const estimatedWeight = Math.max(
      1,
      Math.round(product.price / DEFAULT_FILAMENT_VALUE_PER_GRAM),
    )

    await prisma.product.update({
      where: { id: product.id },
      data: { weight: estimatedWeight },
    })

    console.log(
      `  ${product.code}: precio $${product.price} → weight estimado ${estimatedWeight}g`,
    )
  }

  console.log('Backfill completado.')
}

main()
  .catch(err => {
    console.error('Error en backfill:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
