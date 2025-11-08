-- CreateIndex
CREATE INDEX "Follow_followerId_id_idx" ON "Follow"("followerId", "id");

-- CreateIndex
CREATE INDEX "Follow_followingId_id_idx" ON "Follow"("followingId", "id");
