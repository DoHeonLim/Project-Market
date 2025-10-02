-- CreateIndex
CREATE INDEX "StreamMessage_userId_streamChatRoomId_created_at_idx" ON "StreamMessage"("userId", "streamChatRoomId", "created_at");

-- CreateIndex
CREATE INDEX "StreamMessage_streamChatRoomId_created_at_idx" ON "StreamMessage"("streamChatRoomId", "created_at");
