/*
  Warnings:

  - Added the required column `status` to the `LiveStream` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "StreamTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_StreamTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_StreamTags_A_fkey" FOREIGN KEY ("A") REFERENCES "LiveStream" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StreamTags_B_fkey" FOREIGN KEY ("B") REFERENCES "StreamTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "LiveStream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LiveStream" ("created_at", "id", "stream_id", "stream_key", "title", "updated_at", "userId") SELECT "created_at", "id", "stream_id", "stream_key", "title", "updated_at", "userId" FROM "LiveStream";
DROP TABLE "LiveStream";
ALTER TABLE "new_LiveStream" RENAME TO "LiveStream";
CREATE INDEX "LiveStream_status_idx" ON "LiveStream"("status");
CREATE INDEX "LiveStream_cloudflare_status_idx" ON "LiveStream"("cloudflare_status");
CREATE INDEX "LiveStream_scheduled_at_idx" ON "LiveStream"("scheduled_at");
CREATE INDEX "LiveStream_userId_idx" ON "LiveStream"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StreamTag_name_key" ON "StreamTag"("name");

-- CreateIndex
CREATE INDEX "StreamTag_name_idx" ON "StreamTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_StreamTags_AB_unique" ON "_StreamTags"("A", "B");

-- CreateIndex
CREATE INDEX "_StreamTags_B_index" ON "_StreamTags"("B");
