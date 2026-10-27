-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerdictType" AS ENUM ('BUENO', 'MALO', 'REGULAR');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'PROVIDER_REPLIED', 'RESOLVED_AFTER_ISSUE', 'UNDER_MODERATION');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('DEFECT_EVIDENCE', 'COMPLETED_WORK', 'CONTRACT_RECEIPT', 'PROVIDER_REPLY_PROOF');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT,
    "phonePrimary" TEXT NOT NULL,
    "phoneSecondary" TEXT,
    "socialMediaUrl" TEXT,
    "claimedByUserId" TEXT,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "primaryState" TEXT NOT NULL,
    "primaryCity" TEXT NOT NULL,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "goodReviewsCount" INTEGER NOT NULL DEFAULT 0,
    "badReviewsCount" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "verdict" "VerdictType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "costRange" TEXT,
    "gaveAdvancePayment" BOOLEAN NOT NULL DEFAULT false,
    "advancePercentage" INTEGER,
    "hadWrittenContract" BOOLEAN NOT NULL DEFAULT false,
    "postalCode" VARCHAR(5) NOT NULL,
    "state" TEXT NOT NULL,
    "cityOrMunicipality" TEXT NOT NULL,
    "townOrLocality" TEXT,
    "colonia" TEXT NOT NULL,
    "fraccionamiento" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewMedia" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderReply" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpfulVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpfulVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SepomexCatalog" (
    "id" SERIAL NOT NULL,
    "codigoPostal" VARCHAR(5) NOT NULL,
    "asentamiento" TEXT NOT NULL,
    "tipoAsentamiento" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "ciudad" TEXT,

    CONSTRAINT "SepomexCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProviderProfileToServiceCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProviderProfileToServiceCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_claimedByUserId_key" ON "ProviderProfile"("claimedByUserId");

-- CreateIndex
CREATE INDEX "ProviderProfile_phonePrimary_idx" ON "ProviderProfile"("phonePrimary");

-- CreateIndex
CREATE INDEX "ProviderProfile_businessName_idx" ON "ProviderProfile"("businessName");

-- CreateIndex
CREATE INDEX "ProviderProfile_primaryState_primaryCity_idx" ON "ProviderProfile"("primaryState", "primaryCity");

-- CreateIndex
CREATE INDEX "Review_state_cityOrMunicipality_colonia_idx" ON "Review"("state", "cityOrMunicipality", "colonia");

-- CreateIndex
CREATE INDEX "Review_fraccionamiento_idx" ON "Review"("fraccionamiento");

-- CreateIndex
CREATE INDEX "Review_verdict_categoryId_idx" ON "Review"("verdict", "categoryId");

-- CreateIndex
CREATE INDEX "Review_providerId_idx" ON "Review"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderReply_reviewId_key" ON "ProviderReply"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpfulVote_userId_reviewId_key" ON "HelpfulVote"("userId", "reviewId");

-- CreateIndex
CREATE INDEX "ProviderClaim_status_idx" ON "ProviderClaim"("status");

-- CreateIndex
CREATE INDEX "ProviderClaim_providerId_userId_idx" ON "ProviderClaim"("providerId", "userId");

-- CreateIndex
CREATE INDEX "SepomexCatalog_codigoPostal_idx" ON "SepomexCatalog"("codigoPostal");

-- CreateIndex
CREATE INDEX "SepomexCatalog_estado_municipio_idx" ON "SepomexCatalog"("estado", "municipio");

-- CreateIndex
CREATE INDEX "SepomexCatalog_asentamiento_idx" ON "SepomexCatalog"("asentamiento");

-- CreateIndex
CREATE INDEX "_ProviderProfileToServiceCategory_B_index" ON "_ProviderProfileToServiceCategory"("B");

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewMedia" ADD CONSTRAINT "ReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderReply" ADD CONSTRAINT "ProviderReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderReply" ADD CONSTRAINT "ProviderReply_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpfulVote" ADD CONSTRAINT "HelpfulVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpfulVote" ADD CONSTRAINT "HelpfulVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderClaim" ADD CONSTRAINT "ProviderClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderClaim" ADD CONSTRAINT "ProviderClaim_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderProfileToServiceCategory" ADD CONSTRAINT "_ProviderProfileToServiceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "ProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderProfileToServiceCategory" ADD CONSTRAINT "_ProviderProfileToServiceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
