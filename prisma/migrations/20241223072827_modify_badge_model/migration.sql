/*
  Warnings:

  - You are about to drop the column `badgeId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "_BadgeToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BadgeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BadgeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "github_id" TEXT,
    "avatar" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "created_at", "email", "github_id", "id", "password", "phone", "updated_at", "username") SELECT "avatar", "created_at", "email", "github_id", "id", "password", "phone", "updated_at", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_github_id_key" ON "User"("github_id");
CREATE INDEX "User_username_idx" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_BadgeToUser_AB_unique" ON "_BadgeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BadgeToUser_B_index" ON "_BadgeToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");
