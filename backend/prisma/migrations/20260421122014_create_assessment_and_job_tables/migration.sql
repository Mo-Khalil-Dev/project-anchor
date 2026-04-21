-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "bankConnectionId" TEXT,
    "monthlyIncome" REAL,
    "monthlyExpenses" REAL,
    "monthlyBill" REAL,
    "arrears" REAL,
    "disposableIncome" REAL,
    "billRatio" REAL,
    "hardshipLevel" TEXT,
    "sustainabilityScore" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assessment_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "AssessmentJob_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Assessment_customerId_idx" ON "Assessment"("customerId");

-- CreateIndex
CREATE INDEX "Assessment_bankConnectionId_idx" ON "Assessment"("bankConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentJob_assessmentId_key" ON "AssessmentJob"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentJob_status_idx" ON "AssessmentJob"("status");
