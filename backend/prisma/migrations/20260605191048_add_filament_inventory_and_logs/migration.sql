-- CreateEnum
CREATE TYPE "FilamentLogType" AS ENUM ('MANUAL_ADJUSTMENT', 'SCALE_WEIGHING', 'PRODUCTION_CONSUMPTION');

-- AlterTable
ALTER TABLE "Filament" ADD COLUMN     "currentWeightGrams" DOUBLE PRECISION NOT NULL DEFAULT 1000,
ADD COLUMN     "initialWeightGrams" DOUBLE PRECISION NOT NULL DEFAULT 1000,
ADD COLUMN     "tareWeightGrams" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FilamentLog" (
    "id" TEXT NOT NULL,
    "filamentId" TEXT NOT NULL,
    "productId" TEXT,
    "type" "FilamentLogType" NOT NULL,
    "gramsDelta" DOUBLE PRECISION NOT NULL,
    "previousWeightGrams" DOUBLE PRECISION NOT NULL,
    "newWeightGrams" DOUBLE PRECISION NOT NULL,
    "grossWeightGrams" DOUBLE PRECISION,
    "tareWeightGrams" DOUBLE PRECISION,
    "quantity" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilamentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FilamentLog" ADD CONSTRAINT "FilamentLog_filamentId_fkey" FOREIGN KEY ("filamentId") REFERENCES "Filament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilamentLog" ADD CONSTRAINT "FilamentLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
