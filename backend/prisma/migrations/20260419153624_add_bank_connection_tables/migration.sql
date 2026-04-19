-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BankConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "oauthState" TEXT NOT NULL,
    "reportJobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "connectedAt" DATETIME,
    "dataRetrievedAt" DATETIME,
    "disconnectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankConnection_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankConnectionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "routingNumber" TEXT,
    "accountType" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankAccount_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankIncomeReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankConnectionId" TEXT NOT NULL,
    "monthlyIncome" REAL NOT NULL,
    "salaryIncome" REAL,
    "otherIncome" REAL,
    "dataSource" TEXT NOT NULL,
    "analysisMonth" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankIncomeReport_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankExpenseReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankConnectionId" TEXT NOT NULL,
    "monthlyExpenses" REAL NOT NULL,
    "utilities" REAL,
    "housing" REAL,
    "food" REAL,
    "transport" REAL,
    "other" REAL,
    "dataSource" TEXT NOT NULL,
    "analysisMonth" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankExpenseReport_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankRiskInsights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankConnectionId" TEXT NOT NULL,
    "accountBalance" REAL NOT NULL,
    "transactionVolume" REAL NOT NULL,
    "overdraftUsage" BOOLEAN NOT NULL,
    "dataSource" TEXT NOT NULL,
    "analysisDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankRiskInsights_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BankConnection_oauthState_key" ON "BankConnection"("oauthState");

-- CreateIndex
CREATE UNIQUE INDEX "BankConnection_reportJobId_key" ON "BankConnection"("reportJobId");

-- CreateIndex
CREATE INDEX "BankConnection_customerId_idx" ON "BankConnection"("customerId");

-- CreateIndex
CREATE INDEX "BankConnection_oauthState_idx" ON "BankConnection"("oauthState");

-- CreateIndex
CREATE INDEX "BankConnection_reportJobId_idx" ON "BankConnection"("reportJobId");

-- CreateIndex
CREATE INDEX "BankAccount_bankConnectionId_idx" ON "BankAccount"("bankConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "BankIncomeReport_bankConnectionId_key" ON "BankIncomeReport"("bankConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "BankExpenseReport_bankConnectionId_key" ON "BankExpenseReport"("bankConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "BankRiskInsights_bankConnectionId_key" ON "BankRiskInsights"("bankConnectionId");
