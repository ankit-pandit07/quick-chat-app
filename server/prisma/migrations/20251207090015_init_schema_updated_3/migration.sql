-- DropIndex
DROP INDEX "chat_groups_created_at_idx";

-- CreateIndex
CREATE INDEX "chat_groups_user_id_created_at_idx" ON "chat_groups"("user_id", "created_at");
