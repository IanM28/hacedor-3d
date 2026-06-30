import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  // process.cwd() apunta directo a la carpeta 'backend' donde ejecutas el comando
  const backupPath = path.join(process.cwd(), 'backup_real.json');
  
  if (!fs.existsSync(backupPath)) {
    console.log('❌ Error: No se encontró el archivo backup_real.json en la raíz del backend.');
    return;
  }

  console.log('📖 Leyendo copia de respaldo completa con tus datos reales...');
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  console.log('🗑️ Limpiando tablas viejas de Neon en orden seguro...');
  await prisma.productFilamentUsage.deleteMany();
  await prisma.filamentLog.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.filament.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🚀 Sincronizando catálogo real hacia la nube de Neon...');

  // 1. Tablas primarias (independientes)
  for (const d of data.users) {
    await prisma.user.create({ data: d });
  }
  for (const d of data.categories) {
    await prisma.category.create({ data: d });
  }
  for (const d of data.suppliers) {
    await prisma.supplier.create({ data: d });
  }

  // 2. Tablas secundarias (dependen de las anteriores)
  for (const d of data.filaments) {
    await prisma.filament.create({ data: d });
  }
  for (const d of data.products) {
    await prisma.product.create({ data: d });
  }

  // 3. Tablas terciarias (dependen de productos, filamentos o usuarios)
  for (const d of data.productFilamentUsage) {
    await prisma.productFilamentUsage.create({ data: d });
  }
  for (const d of data.filamentLogs) {
    await prisma.filamentLog.create({ data: d });
  }
  for (const d of data.orders) {
    await prisma.order.create({ data: d });
  }
  for (const d of data.carts) {
    await prisma.cart.create({ data: d });
  }

  // 4. Tablas cuaternarias (dependen de las órdenes y carritos)
  for (const d of data.orderItems) {
    await prisma.orderItem.create({ data: d });
  }
  for (const d of data.cartItems) {
    await prisma.cartItem.create({ data: d });
  }

  console.log('🏁 ¡Sincronización finalizada! Tu Neon ahora es un espejo de tu entorno local.');
}

main()
  .catch((e) => {
    console.error('❌ Error inyectando datos en Neon:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });