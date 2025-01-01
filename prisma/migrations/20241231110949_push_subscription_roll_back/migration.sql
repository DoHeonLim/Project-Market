/*
  Warnings:

  - Added the required column `updated_at` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PushSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_used" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PushSubscription" ("auth", "created_at", "endpoint", "id", "p256dh", "userId") SELECT "auth", "created_at", "endpoint", "id", "p256dh", "userId" FROM "PushSubscription";
DROP TABLE "PushSubscription";
ALTER TABLE "new_PushSubscription" RENAME TO "PushSubscription";
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
CREATE INDEX "PushSubscription_isActive_idx" ON "PushSubscription"("isActive");
CREATE UNIQUE INDEX "PushSubscription_endpoint_userId_key" ON "PushSubscription"("endpoint", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
