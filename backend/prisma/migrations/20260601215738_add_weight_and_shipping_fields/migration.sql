-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingLabelUrl" TEXT,
ADD COLUMN     "shippingPostalCode" TEXT,
ADD COLUMN     "shippingProvider" TEXT,
ADD COLUMN     "shippingService" TEXT,
ADD COLUMN     "shippingTrackingNumber" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 0;
