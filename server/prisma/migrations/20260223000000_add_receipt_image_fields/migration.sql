-- AddColumn: receiptImageUrl and receiptImagePublicId to payments table
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "receiptImageUrl" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "receiptImagePublicId" TEXT;
