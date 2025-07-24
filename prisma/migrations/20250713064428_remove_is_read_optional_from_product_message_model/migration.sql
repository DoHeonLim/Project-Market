-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payload" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "productChatRoomId" TEXT,
    CONSTRAINT "ProductMessage_productChatRoomId_fkey" FOREIGN KEY ("productChatRoomId") REFERENCES "ProductChatRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductMessage" ("created_at", "id", "isRead", "payload", "productChatRoomId", "updated_at", "userId") SELECT "created_at", "id", coalesce("isRead", false) AS "isRead", "payload", "productChatRoomId", "updated_at", "userId" FROM "ProductMessage";
DROP TABLE "ProductMessage";
ALTER TABLE "new_ProductMessage" RENAME TO "ProductMessage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
