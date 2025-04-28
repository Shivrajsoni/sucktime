-- AlterTable
ALTER TABLE "Validator" ADD COLUMN     "isAmountClaimed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "solanaTransactions" (
    "id" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "signature" TEXT NOT NULL,

    CONSTRAINT "solanaTransactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "solanaTransactions" ADD CONSTRAINT "solanaTransactions_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
