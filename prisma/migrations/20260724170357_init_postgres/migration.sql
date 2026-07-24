-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordPlain" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL,
    "businessRegNo" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "salesRepId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "promisedMonthlyRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payTier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteLineItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "discountRate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "QuoteLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "retailPrice" DOUBLE PRECISION NOT NULL,
    "supplyPrice" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapitalRate" (
    "categoryKey" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CapitalRate_pkey" PRIMARY KEY ("categoryKey")
);

-- CreateTable
CREATE TABLE "CardFeeTier" (
    "id" TEXT NOT NULL,
    "payTier" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "feeRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CardFeeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PgDeductionTier" (
    "grade" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PgDeductionTier_pkey" PRIMARY KEY ("grade")
);

-- CreateTable
CREATE TABLE "GradeThreshold" (
    "grade" TEXT NOT NULL,
    "minAnnualRevenue" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GradeThreshold_pkey" PRIMARY KEY ("grade")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "vanFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.012,
    "supportMonths" INTEGER NOT NULL DEFAULT 48,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Advertiser_businessRegNo_key" ON "Advertiser"("businessRegNo");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_advertiserId_key" ON "Quote"("advertiserId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteLineItem_quoteId_categoryKey_slotKey_key" ON "QuoteLineItem"("quoteId", "categoryKey", "slotKey");

-- CreateIndex
CREATE INDEX "Product_categoryKey_slotKey_idx" ON "Product"("categoryKey", "slotKey");

-- CreateIndex
CREATE UNIQUE INDEX "CardFeeTier_payTier_grade_key" ON "CardFeeTier"("payTier", "grade");

-- AddForeignKey
ALTER TABLE "Advertiser" ADD CONSTRAINT "Advertiser_salesRepId_fkey" FOREIGN KEY ("salesRepId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
