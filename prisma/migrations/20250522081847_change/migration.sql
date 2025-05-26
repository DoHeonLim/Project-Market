-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "eng_name" TEXT,
    "kor_name" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "parentId" INTEGER,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("description", "icon", "id", "name", "parentId") SELECT "description", "icon", "id", "name", "parentId" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE TABLE "new_StreamCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "eng_name" TEXT,
    "kor_name" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "parentId" INTEGER,
    CONSTRAINT "StreamCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StreamCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StreamCategory" ("description", "icon", "id", "name", "parentId") SELECT "description", "icon", "id", "name", "parentId" FROM "StreamCategory";
DROP TABLE "StreamCategory";
ALTER TABLE "new_StreamCategory" RENAME TO "StreamCategory";
CREATE INDEX "StreamCategory_parentId_idx" ON "StreamCategory"("parentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
