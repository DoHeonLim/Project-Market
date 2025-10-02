-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VodAsset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "broadcastId" INTEGER NOT NULL,
    "provider_asset_id" TEXT NOT NULL,
    "playback_hls" TEXT,
    "playback_dash" TEXT,
    "thumbnail_url" TEXT,
    "duration_sec" INTEGER,
    "ready_at" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "VodAsset_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VodAsset" ("broadcastId", "created_at", "duration_sec", "id", "playback_dash", "playback_hls", "provider_asset_id", "ready_at", "thumbnail_url", "updated_at") SELECT "broadcastId", "created_at", "duration_sec", "id", "playback_dash", "playback_hls", "provider_asset_id", "ready_at", "thumbnail_url", "updated_at" FROM "VodAsset";
DROP TABLE "VodAsset";
ALTER TABLE "new_VodAsset" RENAME TO "VodAsset";
CREATE UNIQUE INDEX "VodAsset_provider_asset_id_key" ON "VodAsset"("provider_asset_id");
CREATE INDEX "VodAsset_broadcastId_idx" ON "VodAsset"("broadcastId");
CREATE INDEX "VodAsset_ready_at_idx" ON "VodAsset"("ready_at");
CREATE INDEX "VodAsset_views_idx" ON "VodAsset"("views");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
