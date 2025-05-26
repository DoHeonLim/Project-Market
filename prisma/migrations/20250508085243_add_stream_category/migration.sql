/*
  Warnings:

  - Added the required column `categoryId` to the `LiveStream` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "StreamCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "parentId" INTEGER,
    CONSTRAINT "StreamCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StreamCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LiveStream" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "stream_key" TEXT NOT NULL,
    "stream_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cloudflare_status" TEXT,
    "last_status_check" DATETIME,
    "scheduled_at" DATETIME,
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "viewer_count" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "cloudflare_uid" TEXT,
    "playback_url" TEXT,
    "recording_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "LiveStream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiveStream_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StreamCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LiveStream_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LiveStream" ("cloudflare_status", "cloudflare_uid", "created_at", "description", "duration", "ended_at", "id", "is_public", "last_status_check", "playback_url", "recording_url", "scheduled_at", "started_at", "status", "stream_id", "stream_key", "thumbnail", "title", "updated_at", "userId", "viewer_count") SELECT "cloudflare_status", "cloudflare_uid", "created_at", "description", "duration", "ended_at", "id", "is_public", "last_status_check", "playback_url", "recording_url", "scheduled_at", "started_at", "status", "stream_id", "stream_key", "thumbnail", "title", "updated_at", "userId", "viewer_count" FROM "LiveStream";
DROP TABLE "LiveStream";
ALTER TABLE "new_LiveStream" RENAME TO "LiveStream";
CREATE INDEX "LiveStream_status_idx" ON "LiveStream"("status");
CREATE INDEX "LiveStream_cloudflare_status_idx" ON "LiveStream"("cloudflare_status");
CREATE INDEX "LiveStream_scheduled_at_idx" ON "LiveStream"("scheduled_at");
CREATE INDEX "LiveStream_userId_idx" ON "LiveStream"("userId");
CREATE INDEX "LiveStream_categoryId_idx" ON "LiveStream"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StreamCategory_parentId_idx" ON "StreamCategory"("parentId");
