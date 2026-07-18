-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'QRIS', 'E_WALLET', 'LAINNYA');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "method" "PaymentMethod",
ADD COLUMN     "referenceNo" TEXT;
