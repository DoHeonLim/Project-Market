/*
  Warnings:

  - You are about to drop the `LiveStream` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StreamViewer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StreamTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `streamId` on the `RecordingComment` table. All the data in the column will be lost.
  - The primary key for the `RecordingLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `streamId` on the `RecordingLike` table. All the data in the column will be lost.
  - You are about to drop the column `liveStreamId` on the `StreamChatRoom` table. All the data in the column will be lost.
  - Added the required column `vodId` to the `RecordingComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vodId` to the `RecordingLike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `broadcastId` to the `StreamChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LiveStream_status_idx";

-- DropIndex
DROP INDEX "StreamViewer_userId_streamId_key";

-- DropIndex
DROP INDEX "StreamViewer_streamId_idx";

-- DropIndex
DROP INDEX "_StreamTags_B_index";

-- DropIndex
DROP INDEX "_StreamTags_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LiveStream";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StreamViewer";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_StreamTags";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LiveInput" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "provider_uid" TEXT NOT NULL,
    "stream_key" TEXT NOT NULL,
    "name" TEXT,
    "deleteAfterDays" INTEGER,
    "requireSignedURLs" BOOLEAN NOT NULL DEFAULT false,
    "hideLiveViewerCount" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "LiveInput_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "liveInputId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "password" TEXT,
    "status" TEXT NOT NULL,
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "streamCategoryId" INTEGER,
    CONSTRAINT "Broadcast_liveInputId_fkey" FOREIGN KEY ("liveInputId") REFERENCES "LiveInput" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Broadcast_streamCategoryId_fkey" FOREIGN KEY ("streamCategoryId") REFERENCES "StreamCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VodAsset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "broadcastId" INTEGER NOT NULL,
    "provider_asset_id" TEXT NOT NULL,
    "playback_hls" TEXT,
    "playback_dash" TEXT,
    "thumbnail_url" TEXT,
    "duration_sec" INTEGER,
    "ready_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "VodAsset_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BroadcastTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BroadcastTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Broadcast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BroadcastTags_B_fkey" FOREIGN KEY ("B") REFERENCES "StreamTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecordingComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payload" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "vodId" INTEGER NOT NULL,
    CONSTRAINT "RecordingComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecordingComment_vodId_fkey" FOREIGN KEY ("vodId") REFERENCES "VodAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecordingComment" ("created_at", "id", "payload", "userId") SELECT "created_at", "id", "payload", "userId" FROM "RecordingComment";
DROP TABLE "RecordingComment";
ALTER TABLE "new_RecordingComment" RENAME TO "RecordingComment";
CREATE INDEX "RecordingComment_vodId_created_at_idx" ON "RecordingComment"("vodId", "created_at");
CREATE TABLE "new_RecordingLike" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "vodId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "vodId"),
    CONSTRAINT "RecordingLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecordingLike_vodId_fkey" FOREIGN KEY ("vodId") REFERENCES "VodAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecordingLike" ("created_at", "updated_at", "userId") SELECT "created_at", "updated_at", "userId" FROM "RecordingLike";
DROP TABLE "RecordingLike";
ALTER TABLE "new_RecordingLike" RENAME TO "RecordingLike";
CREATE TABLE "new_StreamChatRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "broadcastId" INTEGER NOT NULL,
    CONSTRAINT "StreamChatRoom_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StreamChatRoom" ("created_at", "id", "updated_at") SELECT "created_at", "id", "updated_at" FROM "StreamChatRoom";
DROP TABLE "StreamChatRoom";
ALTER TABLE "new_StreamChatRoom" RENAME TO "StreamChatRoom";
CREATE UNIQUE INDEX "StreamChatRoom_broadcastId_key" ON "StreamChatRoom"("broadcastId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LiveInput_provider_uid_key" ON "LiveInput"("provider_uid");

-- CreateIndex
CREATE INDEX "LiveInput_userId_idx" ON "LiveInput"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveInput_userId_key" ON "LiveInput"("userId");

-- CreateIndex
CREATE INDEX "Broadcast_liveInputId_idx" ON "Broadcast"("liveInputId");

-- CreateIndex
CREATE INDEX "Broadcast_status_idx" ON "Broadcast"("status");

-- CreateIndex
CREATE INDEX "Broadcast_started_at_idx" ON "Broadcast"("started_at");

-- CreateIndex
CREATE INDEX "Broadcast_streamCategoryId_idx" ON "Broadcast"("streamCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "VodAsset_provider_asset_id_key" ON "VodAsset"("provider_asset_id");

-- CreateIndex
CREATE INDEX "VodAsset_broadcastId_idx" ON "VodAsset"("broadcastId");

-- CreateIndex
CREATE INDEX "VodAsset_ready_at_idx" ON "VodAsset"("ready_at");

-- CreateIndex
CREATE UNIQUE INDEX "_BroadcastTags_AB_unique" ON "_BroadcastTags"("A", "B");

-- CreateIndex
CREATE INDEX "_BroadcastTags_B_index" ON "_BroadcastTags"("B");
