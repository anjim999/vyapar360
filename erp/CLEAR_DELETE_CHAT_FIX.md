# Clear Chat & Delete Chat Fix

## Problem
The clear chat and delete chat functions were not working properly:
1. Messages would still appear after refreshing the browser
2. Database constraint errors were occurring
3. The chat list wasn't updating after clear/delete operations

## Root Causes

### 1. Database Constraint Issue
The `user_deleted_chats` table had an incorrect UNIQUE constraint:
```sql
UNIQUE(user_id, chat_user_id, channel_id)
```

This constraint required ALL three fields, but:
- Direct messages only set `user_id` and `chat_user_id` (channel_id was NULL)
- Channels only set `user_id` and `channel_id` (chat_user_id was NULL)

The `ON CONFLICT` clause couldn't match the constraint properly, causing INSERT failures.

### 2. Missing UI Refresh
After clearing or deleting a chat, the recent chats list wasn't being refreshed, so:
- The conversation would still show in the sidebar
- On refresh, old data would reload from cache

## Solutions Implemented

### Backend Fixes (`/backend/src/routes/teams.js`)

1. **Updated table structure** with separate unique constraints:
```sql
CONSTRAINT unique_dm_delete UNIQUE(user_id, chat_user_id)
CONSTRAINT unique_channel_delete UNIQUE(user_id, channel_id)
```

2. **Fixed INSERT statements** for direct messages:
```sql
INSERT INTO user_deleted_chats (user_id, chat_user_id, channel_id) 
VALUES ($1, $2, NULL) 
ON CONFLICT ON CONSTRAINT unique_dm_delete 
DO UPDATE SET deleted_at = NOW()
```

3. **Fixed INSERT statements** for channels:
```sql
INSERT INTO user_deleted_chats (user_id, chat_user_id, channel_id) 
VALUES ($1, NULL, $2) 
ON CONFLICT ON CONSTRAINT unique_channel_delete 
DO UPDATE SET deleted_at = NOW()
```

### Database Migration (`/backend/src/db/migrations/011_fix_user_deleted_chats.sql`)

Created a migration to:
- Drop the old table with incorrect constraints
- Recreate with proper separate constraints
- Add a CHECK constraint to ensure data integrity
- Add indexes for better query performance

### Frontend Fixes (`/frontend/src/pages/TeamsPage.jsx`)

Added `fetchRecentChats()` calls after successful clear/delete operations:
```javascript
await api.delete(`/api/teams/direct-messages/${selectedChat.other_user_id}/clear`);
setMessages([]);
fetchRecentChats(); // ← Added this
toast.success('Chat cleared');
```

## How It Works Now

### Clear Chat
1. User clicks "Clear chat" from the header menu
2. Backend creates/updates a record in `user_deleted_chats` with current timestamp
3. Frontend clears current messages and refreshes the chat list
4. Future message fetches filter out messages created before the clear timestamp
5. **Only affects the current user** - other participants still see all messages

### Delete Chat  
1. User clicks "Delete chat" from the header menu
2. Backend creates/updates a record in `user_deleted_chats` with current timestamp
3. Frontend refreshes the chat list, closes the conversation
4. The conversation will only show messages sent AFTER the delete timestamp
5. **Only affects the current user** - other participants still see all messages

### Per-User Behavior
- Clearing/deleting a chat only hides messages for the user who performed the action
- The other user(s) in the conversation still see all messages
- If new messages are sent, they will appear for everyone
- Messages sent after clearing will be visible to the user who cleared

## Testing

To verify the fixes work:

1. **Test Clear Chat:**
   - Open a DM conversation with messages
   - Click menu (⋮) → Clear chat
   - Confirm the action
   - Messages should disappear immediately
   - Refresh the browser - messages should still be gone
   - Send a new message - it should appear

2. **Test Delete Chat:**
   - Open a DM conversation
   - Click menu (⋮) → Delete chat
   - Confirm the action
   - Chat should close and messages clear
   - Refresh the browser - chat should not reappear with old messages
   - Start a new conversation with the same user - old messages should not show

3. **Test Channel Clear:**
   - Open a team channel with messages
   - Click menu (⋮) → Clear chat
   - Confirm the action
   - Messages should disappear
   - Refresh the browser - messages should stay cleared

## Files Modified

### Backend
- `/backend/src/routes/teams.js` - Fixed clear/delete endpoints (3 functions)
- `/backend/src/db/migrations/011_fix_user_deleted_chats.sql` - New migration

### Frontend
- `/frontend/src/pages/TeamsPage.jsx` - Added refresh calls after clear/delete

## Database Schema

The `user_deleted_chats` table now has this structure:
```sql
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
```

The CHECK constraint ensures that either `chat_user_id` OR `channel_id` is set, but not both.
