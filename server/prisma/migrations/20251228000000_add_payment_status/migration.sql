-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAGADO', 'VENCIDO', 'FUTURO');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "status" "PaymentStatus" NOT NULL DEFAULT 'FUTURO';

-- Update existing payments based on paymentDate and dueDate
UPDATE "payments" 
SET "status" = CASE
  WHEN "paymentDate" IS NOT NULL AND "paymentDate" <= CURRENT_DATE THEN 'PAGADO'::"PaymentStatus"
  WHEN "dueDate" < CURRENT_DATE THEN 'VENCIDO'::"PaymentStatus"
  ELSE 'FUTURO'::"PaymentStatus"
END;

