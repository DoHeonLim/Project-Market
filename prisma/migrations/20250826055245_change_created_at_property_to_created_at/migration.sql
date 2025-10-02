/*
  Warnings:

  - You are about to drop the column `createdAt` on the `EmailToken` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `EmailToken` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `EmailToken` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `StreamTag` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `StreamTag` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `StreamViewer` table. All the data in the column will be lost.
  - You are about to drop the column `leftAt` on the `StreamViewer` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `EmailToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `EmailToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `StreamTag` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "expires_at" DATETIME NOT NULL,
    CONSTRAINT "EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmailToken" ("email", "id", "token", "userId") SELECT "email", "id", "token", "userId" FROM "EmailToken";
DROP TABLE "EmailToken";
ALTER TABLE "new_EmailToken" RENAME TO "EmailToken";
CREATE UNIQUE INDEX "EmailToken_token_key" ON "EmailToken"("token");
CREATE INDEX "EmailToken_userId_idx" ON "EmailToken"("userId");
CREATE TABLE "new_StreamTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_StreamTag" ("id", "name") SELECT "id", "name" FROM "StreamTag";
DROP TABLE "StreamTag";
ALTER TABLE "new_StreamTag" RENAME TO "StreamTag";
CREATE UNIQUE INDEX "StreamTag_name_key" ON "StreamTag"("name");
CREATE INDEX "StreamTag_name_idx" ON "StreamTag"("name");
CREATE TABLE "new_StreamViewer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "streamId" INTEGER NOT NULL,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" DATETIME,
    CONSTRAINT "StreamViewer_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "LiveStream" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StreamViewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StreamViewer" ("id", "streamId", "userId") SELECT "id", "streamId", "userId" FROM "StreamViewer";
DROP TABLE "StreamViewer";
ALTER TABLE "new_StreamViewer" RENAME TO "StreamViewer";
CREATE INDEX "StreamViewer_streamId_idx" ON "StreamViewer"("streamId");
CREATE UNIQUE INDEX "StreamViewer_userId_streamId_key" ON "StreamViewer"("userId", "streamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
