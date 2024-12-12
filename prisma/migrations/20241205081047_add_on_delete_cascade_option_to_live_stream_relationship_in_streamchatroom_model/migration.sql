-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StreamChatRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "liveStreamId" INTEGER NOT NULL,
    CONSTRAINT "StreamChatRoom_liveStreamId_fkey" FOREIGN KEY ("liveStreamId") REFERENCES "LiveStream" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StreamChatRoom" ("created_at", "id", "liveStreamId", "updated_at") SELECT "created_at", "id", "liveStreamId", "updated_at" FROM "StreamChatRoom";
DROP TABLE "StreamChatRoom";
ALTER TABLE "new_StreamChatRoom" RENAME TO "StreamChatRoom";
CREATE UNIQUE INDEX "StreamChatRoom_liveStreamId_key" ON "StreamChatRoom"("liveStreamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
