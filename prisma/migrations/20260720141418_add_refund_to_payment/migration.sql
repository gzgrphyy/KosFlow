-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "refundNote" TEXT,
ADD COLUMN     "refundedAmount" DECIMAL(12,2) DEFAULT 0,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "refundedById" TEXT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_refundedById_fkey" FOREIGN KEY ("refundedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
