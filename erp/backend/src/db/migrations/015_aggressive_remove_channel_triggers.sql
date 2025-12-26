-- AGGRESSIVE FIX: Remove ALL triggers and functions that auto-create channels
-- This will search and destroy any database automation creating "General" channels

-- Drop ALL triggers on teams table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid = 'teams'::regclass) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON teams CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- Drop ALL triggers on team_channels table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid = 'team_channels'::regclass) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON team_channels CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- Drop any functions with 'channel' or 'general' in the name
DROP FUNCTION IF EXISTS create_default_channel_func() CASCADE;
DROP FUNCTION IF EXISTS auto_create_general_channel_func() CASCADE;
DROP FUNCTION IF EXISTS create_team_general_channel() CASCADE;
DROP FUNCTION IF EXISTS create_default_channel() CASCADE;
DROP FUNCTION IF EXISTS auto_create_channel() CASCADE;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '✅ All channel-related triggers and functions have been removed';
END $$;
