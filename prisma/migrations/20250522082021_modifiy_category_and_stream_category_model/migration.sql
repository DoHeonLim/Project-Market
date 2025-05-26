/*
  Warnings:

  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `StreamCategory` table. All the data in the column will be lost.
  - Made the column `eng_name` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kor_name` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eng_name` on table `StreamCategory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kor_name` on table `StreamCategory` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eng_name" TEXT NOT NULL,
    "kor_name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "parentId" INTEGER,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("description", "eng_name", "icon", "id", "kor_name", "parentId") SELECT "description", "eng_name", "icon", "id", "kor_name", "parentId" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE TABLE "new_StreamCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eng_name" TEXT NOT NULL,
    "kor_name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "parentId" INTEGER,
    CONSTRAINT "StreamCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StreamCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StreamCategory" ("description", "eng_name", "icon", "id", "kor_name", "parentId") SELECT "description", "eng_name", "icon", "id", "kor_name", "parentId" FROM "StreamCategory";
DROP TABLE "StreamCategory";
ALTER TABLE "new_StreamCategory" RENAME TO "StreamCategory";
CREATE INDEX "StreamCategory_parentId_idx" ON "StreamCategory"("parentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
