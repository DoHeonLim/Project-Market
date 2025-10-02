-- CreateTable
CREATE TABLE "RecordingLike" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "streamId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "streamId"),
    CONSTRAINT "RecordingLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecordingLike_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "LiveStream" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecordingComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payload" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "streamId" INTEGER NOT NULL,
    CONSTRAINT "RecordingComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecordingComment_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "LiveStream" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
