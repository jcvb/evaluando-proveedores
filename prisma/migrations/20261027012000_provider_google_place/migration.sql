-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN "googlePlaceId" TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN "googleMapsUrl" TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN "googleFormattedAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_googlePlaceId_key" ON "ProviderProfile"("googlePlaceId");
