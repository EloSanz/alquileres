-- CreateEnum
CREATE TYPE "ReceiptKind" AS ENUM ('GENERATED', 'UPLOADED');

-- Remove ARBITRIOS from ServiceType enum (safe: no production data uses it)
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
CREATE TYPE "ServiceType" AS ENUM ('AGUA', 'LUZ');
ALTER TABLE "services" ALTER COLUMN "serviceType" TYPE "ServiceType" USING "serviceType"::text::"ServiceType";
DROP TYPE "ServiceType_old";

-- CreateTable ServiceCategory
CREATE TABLE "service_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateTable ServiceReceipt
CREATE TABLE "service_receipts" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "tenantId" INTEGER,
    "tenantName" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30),
    "receiptImageUrl" TEXT,
    "receiptImagePublicId" TEXT,
    "kind" "ReceiptKind" NOT NULL DEFAULT 'GENERATED',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_receipts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_receipts" ADD CONSTRAINT "service_receipts_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_receipts" ADD CONSTRAINT "service_receipts_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed initial service categories
INSERT INTO "service_categories" ("name", "label") VALUES
    ('AGUA', 'Agua'),
    ('LUZ', 'Luz')
ON CONFLICT ("name") DO NOTHING;
