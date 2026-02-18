-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('FEED', 'STORY', 'REEL', 'AD');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'APPROVED', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('MWF', 'TU_TH_SA');

-- CreateTable
CREATE TABLE "SocialMediaProfile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT '',
    "niche" TEXT NOT NULL DEFAULT '',
    "targetAudience" TEXT NOT NULL DEFAULT '',
    "brandTone" TEXT NOT NULL DEFAULT 'professional',
    "platforms" TEXT[] DEFAULT ARRAY['instagram']::TEXT[],
    "goals" TEXT NOT NULL DEFAULT '',
    "competitors" TEXT NOT NULL DEFAULT '',
    "brandColors" TEXT NOT NULL DEFAULT '',
    "sampleContent" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPlan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL DEFAULT 'MWF',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPost" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "postType" "PostType" NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "captionAr" TEXT NOT NULL DEFAULT '',
    "captionEn" TEXT NOT NULL DEFAULT '',
    "hashtags" TEXT NOT NULL DEFAULT '',
    "cta" TEXT NOT NULL DEFAULT '',
    "adHeadline" TEXT NOT NULL DEFAULT '',
    "adBody" TEXT NOT NULL DEFAULT '',
    "hookScript" TEXT NOT NULL DEFAULT '',
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "aiProvider" TEXT NOT NULL DEFAULT 'openai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaProfile_clientId_key" ON "SocialMediaProfile"("clientId");

-- AddForeignKey
ALTER TABLE "SocialMediaProfile" ADD CONSTRAINT "SocialMediaProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlan" ADD CONSTRAINT "ContentPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SocialMediaProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ContentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
