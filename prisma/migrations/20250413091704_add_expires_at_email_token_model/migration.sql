/*
  Warnings:

  - Added the required column `expiresAt` to the `EmailToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmailToken" ("createdAt", "email", "id", "token", "updatedAt", "userId") SELECT "createdAt", "email", "id", "token", "updatedAt", "userId" FROM "EmailToken";
DROP TABLE "EmailToken";
ALTER TABLE "new_EmailToken" RENAME TO "EmailToken";
CREATE UNIQUE INDEX "EmailToken_token_key" ON "EmailToken"("token");
CREATE INDEX "EmailToken_userId_idx" ON "EmailToken"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
