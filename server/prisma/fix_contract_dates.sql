-- Script para actualizar fechas de contratos existentes
-- Ejecutar este script si las fechas siguen mostrando 2024

-- Actualizar todos los contratos activos a fechas de 2025
UPDATE "contracts" 
SET 
  "startDate" = '2025-01-01'::date,
  "endDate" = '2025-12-31'::date,
  "updatedAt" = NOW()
WHERE "propertyId" IS NOT NULL;

-- Verificar que se actualizaron correctamente
SELECT 
  id,
  "startDate",
  "endDate",
  "propertyId",
  "tenantFullName"
FROM "contracts"
ORDER BY id
LIMIT 10;

