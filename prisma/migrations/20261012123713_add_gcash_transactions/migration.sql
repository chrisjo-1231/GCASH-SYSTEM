-- CreateEnum
CREATE TYPE "GcashTransactionType" AS ENUM ('CASH_IN', 'CASH_OUT');

-- CreateEnum
CREATE TYPE "GcashTransactionStatus" AS ENUM ('COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "GcashTransaction" (
    "id" SERIAL NOT NULL,
    "type" "GcashTransactionType" NOT NULL,
    "status" "GcashTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "customerName" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "serviceFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GcashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GcashTransaction_referenceNumber_key" ON "GcashTransaction"("referenceNumber");
