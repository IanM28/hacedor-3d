import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Iniciando el sembrado de datos (seed)...')

  // 1. Categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'aero' },
      update: { name: 'Aeroespacial', isActive: true },
      create: { name: 'Aeroespacial', slug: 'aero', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'mod' },
      update: { name: 'Modular', isActive: true },
      create: { name: 'Modular', slug: 'mod', isActive: true },
    }),
  ])

  const aeroCategory = categories.find(c => c.slug === 'aero')
  const modCategory = categories.find(c => c.slug === 'mod')

  if (!aeroCategory || !modCategory) throw new Error('Error al crear categorías')

  // 2. Proveedor
  const supplier = await prisma.supplier.upsert({
    where: { id: 'default-supplier' }, // Usamos un ID fijo para el seed
    update: {},
    create: {
      id: 'default-supplier',
      name: 'Proveedor Demo',
      email: 'proveedor@hacedor3d.com',
      phone: '+54 9 2944 000000',
      address: 'Bariloche, Río Negro, AR',
      cbu: '0000000000000000000000',
      isActive: true,
    },
  })

  // 3. Productos
  const productsData = [
    {
      code: 'AERO-01',
      name: 'AERO-01',
      description: 'Pieza de diseño de estética aeroespacial.',
      price: 24999,
      stock: 6,
      categoryId: aeroCategory.id,
    },
    {
      code: 'AERO-02',
      name: 'AERO-02',
      description: 'Geometría precisa con lenguaje técnico minimal.',
      price: 28999,
      stock: 3,
      categoryId: aeroCategory.id,
    },
    {
      code: 'MOD-01',
      name: 'MOD-01',
      description: 'Objeto modular y funcional con presencia premium.',
      price: 19999,
      stock: 12,
      categoryId: modCategory.id,
    },
  ]

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
      },
      create: {
        code: p.code,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        images: [`/assets/products/${p.code.toLowerCase()}-1.webp`],
        isActive: true,
        isFeatured: true,
        categoryId: p.categoryId,
        supplierId: supplier.id,
        supplierCost: p.price * 0.5,
        markupPercent: 40,
      },
    })
  }

  // 4. Usuario Admin
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10)

  await prisma.user.upsert({
    where: { email: 'admin@hacedor3d.com' },
    update: {
      password: adminPasswordHash,
    },
    create: {
      email: 'admin@hacedor3d.com',
      name: 'Admin',
      lastName: 'Hacedor3D', // <--- Esto faltaba y causaba el error
      password: adminPasswordHash,
      role: 'ADMIN', // Los Enums se pueden pasar como strings en Prisma
      isActive: true,
    },
  })

  console.log('✅ Seed finalizado con éxito.')
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })