-- Remove any triggers that auto-create "General" channels
-- This migration ensures NO automatic channel creation happens

-- Drop any triggers related to channel creation
DROP TRIGGER IF EXISTS create_default_channel ON teams;
DROP TRIGGER IF EXISTS auto_create_general_channel ON teams;
DROP TRIGGER IF EXISTS team_channel_trigger ON teams;

-- Drop any functions related to auto-creating channels
DROP FUNCTION IF EXISTS create_default_channel_func() CASCADE;
DROP FUNCTION IF EXISTS auto_create_general_channel_func() CASCADE;
DROP FUNCTION IF EXISTS create_team_general_channel() CASCADE;

-- Ensure no default channel logic exists
-- Note: Channels should ONLY be created explicitly via the API endpoints
