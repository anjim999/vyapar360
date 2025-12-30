-- Migration: Create call_history table
-- Purpose: Store history of audio/video calls for users

-- Create call_history table
CREATE TABLE IF NOT EXISTS call_history (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    caller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    channel_id INTEGER, -- Optional channel reference (NULL for direct calls)
    call_type VARCHAR(20) NOT NULL DEFAULT 'video' CHECK (call_type IN ('video', 'audio', 'group_video', 'group_audio')),
    status VARCHAR(20) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'answered', 'completed', 'declined', 'missed', 'failed')),
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_call_history_company ON call_history(company_id);
CREATE INDEX IF NOT EXISTS idx_call_history_caller ON call_history(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_history_receiver ON call_history(receiver_id);
CREATE INDEX IF NOT EXISTS idx_call_history_started_at ON call_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_history_channel ON call_history(channel_id) WHERE channel_id IS NOT NULL;

-- Composite index for user call history lookup
CREATE INDEX IF NOT EXISTS idx_call_history_user_lookup ON call_history(company_id, caller_id, receiver_id, started_at DESC);

