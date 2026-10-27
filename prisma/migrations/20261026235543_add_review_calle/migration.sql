-- DropIndex
DROP INDEX "provider_business_name_trgm";

-- DropIndex
DROP INDEX "review_fraccionamiento_trgm";

-- DropIndex
DROP INDEX "sepomex_asentamiento_trgm";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "calle" TEXT;
