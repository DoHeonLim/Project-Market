/*
  Warnings:

  - You are about to drop the column `cloudflare_uid` on the `LiveStream` table. All the data in the column will be lost.
  - You are about to drop the column `is_public` on the `LiveStream` table. All the data in the column will be lost.
  - You are about to drop the column `playback_url` on the `LiveStream` table. All the data in the column will be lost.
  - You are about to drop the column `recording_url` on the `LiveStream` table. All the data in the column will be lost.

*/
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
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "password" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "streamCategoryId" INTEGER NOT NULL,
    CONSTRAINT "LiveStream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiveStream_streamCategoryId_fkey" FOREIGN KEY ("streamCategoryId") REFERENCES "StreamCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LiveStream" ("created_at", "description", "duration", "ended_at", "id", "last_status_check", "replay_view_count", "started_at", "status", "streamCategoryId", "stream_id", "stream_key", "thumbnail", "title", "updated_at", "userId") SELECT "created_at", "description", "duration", "ended_at", "id", "last_status_check", "replay_view_count", "started_at", "status", "streamCategoryId", "stream_id", "stream_key", "thumbnail", "title", "updated_at", "userId" FROM "LiveStream";
DROP TABLE "LiveStream";
ALTER TABLE "new_LiveStream" RENAME TO "LiveStream";
CREATE INDEX "LiveStream_status_idx" ON "LiveStream"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
