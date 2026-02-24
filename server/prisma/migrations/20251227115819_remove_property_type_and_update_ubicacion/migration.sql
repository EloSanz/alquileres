-- 1. Crear el nuevo enum con los valores correctos
CREATE TYPE "UbicacionType_new" AS ENUM ('BOULEVAR', 'SAN_MARTIN', 'PATIO');

-- 2. Convertir la columna a TEXT para poder hacer el UPDATE libremente
ALTER TABLE "properties" ALTER COLUMN "ubicacion" TYPE TEXT;

-- 3. Ahora actualizar los datos (BOULEVARD → BOULEVAR) sin restricciones de enum
UPDATE "properties" SET "ubicacion" = 'BOULEVAR' WHERE "ubicacion" = 'BOULEVARD';

-- 4. Aplicar el nuevo tipo enum en la columna
ALTER TABLE "properties" ALTER COLUMN "ubicacion" TYPE "UbicacionType_new" USING ("ubicacion"::"UbicacionType_new");

-- 5. Eliminar el enum viejo y renombrar el nuevo
DROP TYPE "UbicacionType";
ALTER TYPE "UbicacionType_new" RENAME TO "UbicacionType";

-- 6. Eliminar la columna propertyType
ALTER TABLE "properties" DROP COLUMN IF EXISTS "propertyType";

-- 7. Eliminar el enum PropertyType si existe
DROP TYPE IF EXISTS "PropertyType";
