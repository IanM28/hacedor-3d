-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "colorHex" TEXT DEFAULT '#4A7C59';

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "contactUrl" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
