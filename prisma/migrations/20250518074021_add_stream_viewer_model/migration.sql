/*
  Warnings:

  - You are about to drop the column `viewer_count` on the `LiveStream` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "StreamViewer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "streamId" INTEGER NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    CONSTRAINT "StreamViewer_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "LiveStream" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StreamViewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "last_status_check" DATETIME,
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "replay_view_count" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "cloudflare_uid" TEXT,
    "playback_url" TEXT,
    "recording_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "streamCategoryId" INTEGER NOT NULL,
    CONSTRAINT "LiveStream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiveStream_streamCategoryId_fkey" FOREIGN KEY ("streamCategoryId") REFERENCES "StreamCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LiveStream" ("cloudflare_uid", "created_at", "description", "duration", "ended_at", "id", "is_public", "last_status_check", "playback_url", "recording_url", "started_at", "status", "streamCategoryId", "stream_id", "stream_key", "thumbnail", "title", "updated_at", "userId") SELECT "cloudflare_uid", "created_at", "description", "duration", "ended_at", "id", "is_public", "last_status_check", "playback_url", "recording_url", "started_at", "status", "streamCategoryId", "stream_id", "stream_key", "thumbnail", "title", "updated_at", "userId" FROM "LiveStream";
DROP TABLE "LiveStream";
ALTER TABLE "new_LiveStream" RENAME TO "LiveStream";
CREATE INDEX "LiveStream_status_idx" ON "LiveStream"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StreamViewer_streamId_idx" ON "StreamViewer"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "StreamViewer_userId_streamId_key" ON "StreamViewer"("userId", "streamId");
