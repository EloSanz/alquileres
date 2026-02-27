-- CreateTable patio_tenants
CREATE TABLE "patio_tenants" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "razonSocial" TEXT,
    "apodo" TEXT,
    "numerosLocales" TEXT NOT NULL,
    "telefono" TEXT,
    "rubro" TEXT,
    "montoAlquiler" DECIMAL(65,30),
    "fechaIngreso" TIMESTAMP(3),
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'AL_DIA',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patio_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable patio_payments
CREATE TABLE "patio_payments" (
    "id" SERIAL NOT NULL,
    "patioTenantId" INTEGER NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "metodoPago" "PaymentMethod" NOT NULL DEFAULT 'YAPE',
    "estado" "PaymentStatus" NOT NULL DEFAULT 'FUTURO',
    "notas" TEXT,
    "pentamontSettled" BOOLEAN NOT NULL DEFAULT false,
    "receiptImageUrl" TEXT,
    "receiptImagePublicId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patio_payments_pkey" PRIMARY KEY ("id")
);

-- Clean up duplicates in payments table before creating the unique index
DELETE FROM payments
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY "contractId", "monthNumber" ORDER BY id DESC) as row_num
        FROM payments
        WHERE "contractId" IS NOT NULL AND "monthNumber" IS NOT NULL
    ) t
    WHERE t.row_num > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_contractId_monthNumber_key" ON "payments"("contractId", "monthNumber");

-- AddForeignKey
ALTER TABLE "patio_payments" ADD CONSTRAINT "patio_payments_patioTenantId_fkey" FOREIGN KEY ("patioTenantId") REFERENCES "patio_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
