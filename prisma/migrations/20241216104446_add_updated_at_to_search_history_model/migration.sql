/*
  Warnings:

  - You are about to alter the column `maxPrice` on the `SearchHistory` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `minPrice` on the `SearchHistory` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `updated_at` to the `SearchHistory` table without a default value. This is not possible if the table is not empty.

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
    "resultCount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SearchHistory" ("category", "condition", "created_at", "game_type", "id", "keyword", "maxPrice", "minPrice", "resultCount", "userId") SELECT "category", "condition", "created_at", "game_type", "id", "keyword", "maxPrice", "minPrice", "resultCount", "userId" FROM "SearchHistory";
DROP TABLE "SearchHistory";
ALTER TABLE "new_SearchHistory" RENAME TO "SearchHistory";
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
