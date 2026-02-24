/*
  Warnings:

  - The values [BOULEVARD] on the enum `UbicacionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UbicacionType_new" AS ENUM ('BOULEVAR', 'SAN_MARTIN', 'PATIO');
ALTER TABLE "properties" ALTER COLUMN "ubicacion" DROP DEFAULT;
ALTER TABLE "properties" ALTER COLUMN "ubicacion" TYPE "UbicacionType_new" USING ("ubicacion"::text::"UbicacionType_new");
ALTER TYPE "UbicacionType" RENAME TO "UbicacionType_old";
ALTER TYPE "UbicacionType_new" RENAME TO "UbicacionType";
DROP TYPE "UbicacionType_old";
ALTER TABLE "properties" ALTER COLUMN "ubicacion" SET DEFAULT 'BOULEVAR';
COMMIT;
