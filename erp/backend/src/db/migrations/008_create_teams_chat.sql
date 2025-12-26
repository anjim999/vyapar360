-- Teams Chat System (Microsoft Teams-like)

-- Teams table (Departments/Projects)
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'department', -- department, project, custom
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Channels within Teams
CREATE TABLE IF NOT EXISTS team_channels (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'standard', -- standard, private, announcement
    is_default BOOLEAN DEFAULT false, -- General channel
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages in Channels
CREATE TABLE IF NOT EXISTS channel_messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES team_channels(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES channel_messages(id) ON DELETE SET NULL, -- For thread replies
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, file, image, system
    attachments JSONB DEFAULT '[]',
    mentions INTEGER[] DEFAULT '{}', -- Array of mentioned user IDs
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES channel_messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL, -- 👍, ❤️, 😂, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Direct Messages (1-on-1)
CREATE TABLE IF NOT EXISTS direct_messages (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES direct_messages(id) ON DELETE SET NULL,
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Read Receipts for Channel Messages
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES channel_messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Typing Indicators (in-memory, but can log)
CREATE TABLE IF NOT EXISTS typing_indicators (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES team_channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_company ON teams(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_team ON team_channels(team_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel ON channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_parent ON channel_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_sender ON channel_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_users ON direct_messages(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);

-- Auto-create default channel trigger REMOVED
-- (Channel name is now specified by the user when creating a team)
