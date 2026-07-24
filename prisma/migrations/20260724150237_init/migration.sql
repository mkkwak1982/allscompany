-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessRegNo" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "salesRepId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Advertiser_salesRepId_fkey" FOREIGN KEY ("salesRepId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advertiserId" TEXT NOT NULL,
    "promisedMonthlyRevenue" REAL NOT NULL DEFAULT 0,
    "payTier" REAL NOT NULL DEFAULT 1,
    "contractStartDate" DATETIME,
    "contractEndDate" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "discountRate" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "QuoteLineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuoteLineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryKey" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "retailPrice" REAL NOT NULL,
    "supplyPrice" REAL NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "CapitalRate" (
    "categoryKey" TEXT NOT NULL PRIMARY KEY,
    "rate" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "CardFeeTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payTier" REAL NOT NULL,
    "grade" TEXT NOT NULL,
    "feeRate" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "PgDeductionTier" (
    "grade" TEXT NOT NULL PRIMARY KEY,
    "rate" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "GradeThreshold" (
    "grade" TEXT NOT NULL PRIMARY KEY,
    "minAnnualRevenue" REAL NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "vanFeeRate" REAL NOT NULL DEFAULT 0.012,
    "supportMonths" INTEGER NOT NULL DEFAULT 48
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
