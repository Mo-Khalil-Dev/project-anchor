/*
  Warnings:

  - You are about to drop the column `reportJobId` on the `BankConnection` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BankConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "oauthState" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "connectedAt" DATETIME,
    "dataRetrievedAt" DATETIME,
    "disconnectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankConnection_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BankConnection" ("connectedAt", "createdAt", "customerId", "dataRetrievedAt", "disconnectedAt", "id", "oauthState", "status", "updatedAt") SELECT "connectedAt", "createdAt", "customerId", "dataRetrievedAt", "disconnectedAt", "id", "oauthState", "status", "updatedAt" FROM "BankConnection";
DROP TABLE "BankConnection";
ALTER TABLE "new_BankConnection" RENAME TO "BankConnection";
CREATE UNIQUE INDEX "BankConnection_oauthState_key" ON "BankConnection"("oauthState");
CREATE INDEX "BankConnection_customerId_idx" ON "BankConnection"("customerId");
CREATE INDEX "BankConnection_oauthState_idx" ON "BankConnection"("oauthState");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
