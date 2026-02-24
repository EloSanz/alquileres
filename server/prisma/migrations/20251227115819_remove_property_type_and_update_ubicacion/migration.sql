-- 1. Drop the default first (it references BOULEVAR which doesn't exist yet)
ALTER TABLE "properties" ALTER COLUMN "ubicacion" DROP DEFAULT;
-- 2. Create new enum WITH BOULEVARD still present
CREATE TYPE "UbicacionType_new" AS ENUM ('BOULEVAR', 'SAN_MARTIN', 'PATIO', 'BOULEVARD');
-- 3. Convert column to new enum
ALTER TABLE "properties" ALTER COLUMN "ubicacion" TYPE "UbicacionType_new" USING ("ubicacion"::text::"UbicacionType_new");
-- 4. Update BOULEVARD to BOULEVAR
UPDATE "properties" SET "ubicacion" = 'BOULEVAR' WHERE "ubicacion" = 'BOULEVARD';
-- 5. Replace old enum with new one
DROP TYPE "UbicacionType";
ALTER TYPE "UbicacionType_new" RENAME TO "UbicacionType";
-- 6. Restore the default
ALTER TABLE "properties" ALTER COLUMN "ubicacion" SET DEFAULT 'BOULEVAR';
-- 7. Drop propertyType column
ALTER TABLE "properties" DROP COLUMN "propertyType";
DROP TYPE IF EXISTS "PropertyType";
