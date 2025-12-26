-- Migration to fix user_deleted_chats table constraints
-- This fixes the issue where clear/delete chat wasn't working due to incorrect unique constraints

-- Drop the old table if it exists (since it might have the wrong constraints)
DROP TABLE IF EXISTS user_deleted_chats CASCADE;

-- Recreate with proper constraints
CREATE TABLE user_deleted_chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    chat_user_id INTEGER,
    channel_id INTEGER,
    deleted_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_dm_delete UNIQUE(user_id, chat_user_id),
    CONSTRAINT unique_channel_delete UNIQUE(user_id, channel_id),
    CONSTRAINT check_dm_or_channel CHECK (
        (chat_user_id IS NOT NULL AND channel_id IS NULL) OR
        (chat_user_id IS NULL AND channel_id IS NOT NULL)
    )
);

-- Add indexes for better query performance
CREATE INDEX idx_user_deleted_chats_user_chat ON user_deleted_chats(user_id, chat_user_id) WHERE chat_user_id IS NOT NULL;
CREATE INDEX idx_user_deleted_chats_user_channel ON user_deleted_chats(user_id, channel_id) WHERE channel_id IS NOT NULL;
