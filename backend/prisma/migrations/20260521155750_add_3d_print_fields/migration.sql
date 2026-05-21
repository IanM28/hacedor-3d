-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "filamentGrams" DOUBLE PRECISION,
ADD COLUMN     "printHours" DOUBLE PRECISION,
ADD COLUMN     "profitMultiplier" DOUBLE PRECISION DEFAULT 8;
