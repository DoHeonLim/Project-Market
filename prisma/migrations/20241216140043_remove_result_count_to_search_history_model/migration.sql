/*
  Warnings:

  - You are about to drop the column `resultCount` on the `SearchHistory` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SearchHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "category" TEXT,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "game_type" TEXT,
    "condition" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SearchHistory" ("category", "condition", "created_at", "game_type", "id", "keyword", "maxPrice", "minPrice", "updated_at", "userId") SELECT "category", "condition", "created_at", "game_type", "id", "keyword", "maxPrice", "minPrice", "updated_at", "userId" FROM "SearchHistory";
DROP TABLE "SearchHistory";
ALTER TABLE "new_SearchHistory" RENAME TO "SearchHistory";
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
