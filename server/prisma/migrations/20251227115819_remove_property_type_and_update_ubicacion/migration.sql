-- First, update existing BOULEVARD values to BOULEVAR
UPDATE "properties" SET "ubicacion" = 'BOULEVAR' WHERE "ubicacion" = 'BOULEVARD';

-- Alter the enum to rename BOULEVARD to BOULEVAR and add PATIO
-- PostgreSQL doesn't support renaming enum values directly, so we need to:
-- 1. Create a new enum with the correct values
CREATE TYPE "UbicacionType_new" AS ENUM ('BOULEVAR', 'SAN_MARTIN', 'PATIO');

-- 2. Update the column to use the new enum
ALTER TABLE "properties" ALTER COLUMN "ubicacion" TYPE "UbicacionType_new" USING ("ubicacion"::text::"UbicacionType_new");

-- 3. Drop the old enum
DROP TYPE "UbicacionType";

-- 4. Rename the new enum to the original name
ALTER TYPE "UbicacionType_new" RENAME TO "UbicacionType";

-- Drop the propertyType column
ALTER TABLE "properties" DROP COLUMN "propertyType";

-- Drop the PropertyType enum
DROP TYPE "PropertyType";

