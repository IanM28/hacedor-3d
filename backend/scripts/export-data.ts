import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Conectando a la base de datos local para una extracción TOTAL...');
  
  // Extraemos absolutamente todas las tablas en paralelo
  const [
    users,
    categories,
    suppliers,
    filaments,
    products,
    productFilamentUsage,
    filamentLogs,
    orders,
    orderItems,
    carts,
    cartItems
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.category.findMany(),
    prisma.supplier.findMany(),
    prisma.filament.findMany(),
    prisma.product.findMany(),
    prisma.productFilamentUsage.findMany(),
    prisma.filamentLog.findMany(),
    prisma.order.findMany(),
    prisma.orderItem.findMany(),
    prisma.cart.findMany(),
    prisma.cartItem.findMany()
  ]);

  const backupData = {
    users,
    categories,
    suppliers,
    filaments,
    products,
    productFilamentUsage,
    filamentLogs,
    orders,
    orderItems,
    carts,
    cartItems
  };

  const outputPath = path.join(__dirname, '../backup_real.json');
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));
  
  console.log(`\n✅ ¡Espejo local creado con éxito en: ${outputPath}!`);
  console.log(`📊 REPORTE DE EXTRACCIÓN:`);
  console.log(`   • Usuarios: ${users.length}`);
  console.log(`   • Productos: ${products.length}`);
  console.log(`   • Relaciones Producto-Filamento: ${productFilamentUsage.length}`);
  console.log(`   • Filamentos en Stock: ${filaments.length}`);
  console.log(`   • Órdenes/Pedidos: ${orders.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error crítico exportando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });