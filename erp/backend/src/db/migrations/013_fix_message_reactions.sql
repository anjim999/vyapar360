-- Fix message_reactions to work with both channel and direct messages
-- Remove the foreign key constraint that only allows channel messages

-- Drop the existing foreign key constraint
ALTER TABLE message_reactions 
DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey;

-- Add columns to distinguish between channel and direct messages
ALTER TABLE message_reactions 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'channel';
-- message_type can be 'channel' or 'direct'

-- Create separate indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_type ON message_reactions(message_type, message_id);
