/*
  Warnings:

  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `photo` on the `Product` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Like";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Message";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "productId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductLike" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "productId"),
    CONSTRAINT "ProductLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductLike_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payload" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "productChatRoomId" TEXT,
    CONSTRAINT "ProductMessage_productChatRoomId_fkey" FOREIGN KEY ("productChatRoomId") REFERENCES "ProductChatRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostLike" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "postId"),
    CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LiveStream" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "stream_key" TEXT NOT NULL,
    "stream_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "LiveStream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LiveStream" ("created_at", "id", "stream_id", "stream_key", "title", "updated_at", "userId") SELECT "created_at", "id", "stream_id", "stream_key", "title", "updated_at", "userId" FROM "LiveStream";
DROP TABLE "LiveStream";
ALTER TABLE "new_LiveStream" RENAME TO "LiveStream";
CREATE TABLE "new_PostImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "postId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PostImage" ("created_at", "id", "order", "postId", "updated_at", "url") SELECT "created_at", "id", "order", "postId", "updated_at", "url" FROM "PostImage";
DROP TABLE "PostImage";
ALTER TABLE "new_PostImage" RENAME TO "PostImage";
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "reservation_at" DATETIME,
    "reservation_userId" INTEGER,
    "purchase_userId" INTEGER,
    "purchased_at" DATETIME,
    CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_reservation_userId_fkey" FOREIGN KEY ("reservation_userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_purchase_userId_fkey" FOREIGN KEY ("purchase_userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("created_at", "description", "id", "price", "purchase_userId", "purchased_at", "reservation_at", "reservation_userId", "title", "updated_at", "userId") SELECT "created_at", "description", "id", "price", "purchase_userId", "purchased_at", "reservation_at", "reservation_userId", "title", "updated_at", "userId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_ProductChatRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "ProductChatRoom_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductChatRoom" ("created_at", "id", "productId", "updated_at") SELECT "created_at", "id", "productId", "updated_at" FROM "ProductChatRoom";
DROP TABLE "ProductChatRoom";
ALTER TABLE "new_ProductChatRoom" RENAME TO "ProductChatRoom";
CREATE TABLE "new_StreamMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payload" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "streamChatRoomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "StreamMessage_streamChatRoomId_fkey" FOREIGN KEY ("streamChatRoomId") REFERENCES "StreamChatRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StreamMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StreamMessage" ("created_at", "id", "payload", "streamChatRoomId", "userId") SELECT "created_at", "id", "payload", "streamChatRoomId", "userId" FROM "StreamMessage";
DROP TABLE "StreamMessage";
ALTER TABLE "new_StreamMessage" RENAME TO "StreamMessage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
