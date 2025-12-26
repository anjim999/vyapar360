-- Migration: Add is_delivered column to direct_messages table
-- This enables tracking of message delivery status for the tick system

ALTER TABLE direct_messages 
ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false;

-- Set existing messages as delivered if they have been read
UPDATE direct_messages 
SET is_delivered = true 
WHERE is_read = true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_is_delivered ON direct_messages(is_delivered);
