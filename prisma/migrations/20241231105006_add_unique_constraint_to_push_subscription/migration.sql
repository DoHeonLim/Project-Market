/*
  Warnings:

  - You are about to drop the column `isActive` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `last_used` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `PushSubscription` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PushSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endpoint" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PushSubscription" ("auth", "created_at", "endpoint", "id", "p256dh", "userId") SELECT "auth", "created_at", "endpoint", "id", "p256dh", "userId" FROM "PushSubscription";
DROP TABLE "PushSubscription";
ALTER TABLE "new_PushSubscription" RENAME TO "PushSubscription";
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
CREATE UNIQUE INDEX "PushSubscription_endpoint_userId_key" ON "PushSubscription"("endpoint", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
