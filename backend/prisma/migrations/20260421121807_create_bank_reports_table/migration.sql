-- CreateTable
CREATE TABLE "BankReports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankConnectionId" TEXT NOT NULL,
    "expensesJson" TEXT NOT NULL,
    "incomeJson" TEXT NOT NULL,
    "totalMonthlyExpenses" REAL NOT NULL,
    "totalMonthlyIncome" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "BankReports_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BankReports_bankConnectionId_key" ON "BankReports"("bankConnectionId");

-- CreateIndex
CREATE INDEX "BankReports_bankConnectionId_idx" ON "BankReports"("bankConnectionId");
