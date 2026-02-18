-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT 'Ezdiharweb',
    "companyNameAr" TEXT NOT NULL DEFAULT 'إزدهار ويب',
    "legalName" TEXT NOT NULL DEFAULT 'Clicksalesmedia LLC',
    "email" TEXT NOT NULL DEFAULT 'info@ezdiharweb.com',
    "phone" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT 'www.ezdiharweb.com',
    "address" TEXT NOT NULL DEFAULT '',
    "taxNumber" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);
