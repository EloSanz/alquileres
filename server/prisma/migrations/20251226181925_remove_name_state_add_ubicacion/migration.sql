-- CreateEnum
CREATE TYPE "UbicacionType" AS ENUM ('BOULEVARD', 'SAN_MARTIN');

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "name",
DROP COLUMN "state",
ADD COLUMN     "ubicacion" "UbicacionType" NOT NULL DEFAULT 'BOULEVARD';
