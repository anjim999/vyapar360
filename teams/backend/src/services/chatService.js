// backend/src/services/chatService.js
import pool from '../db/pool.js';
import { sendToCompany, sendToUser } from '../utils/socketService.js';

export const getDebugTriggers = async () => {
    const triggers = await pool.query(`
        SELECT tgname, tgrelid::regclass::text as table_name, proname as function_name
        FROM pg_trigger 
        JOIN pg_proc ON tgfoid = pg_proc.oid 
        WHERE tgrelid::regclass::text IN ('teams', 'team_channels')
    `);

    const functions = await pool.query(`
        SELECT proname, prosrc 
        FROM pg_proc 
        WHERE proname LIKE '%channel%' OR proname LIKE '%general%'
    `);

    return {
        success: true,
        triggers: triggers.rows,
        functions: functions.rows.map(f => ({ name: f.proname, code: f.prosrc?.substring(0, 200) }))
    };
};

export const getAllTeams = async (userId, companyId) => {
    const result = await pool.query(
        `SELECT t.*, 
               (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
               (SELECT COUNT(*) FROM team_channels WHERE team_id = t.id) as channel_count,
               EXISTS(SELECT 1 FROM team_members WHERE team_id = t.id AND user_id = $1) as is_member
         FROM teams t
         WHERE t.company_id = $2 AND t.is_active = true
         ORDER BY t.name`,
        [userId, companyId]
    );

    return { success: true, data: result.rows };
};

export const createTeam = async (userId, companyId, { name, type = 'custom', members = [], initial_channel }) => {
    if (!name?.trim()) {
        const error = new Error('Team name is required');
        error.statusCode = 400;
        throw error;
    }

    try {
        await pool.query(`
            DROP TRIGGER IF EXISTS trigger_create_default_channel ON teams CASCADE;
            DROP FUNCTION IF EXISTS create_default_channel() CASCADE;
        `);
    } catch (e) { }

    const teamResult = await pool.query(
        `INSERT INTO teams (company_id, name, type, created_by) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [companyId, name, type, userId]
    );
    const team = teamResult.rows[0];

    await pool.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')`,
        [team.id, userId]
    );

    for (const memberId of members) {
        if (memberId !== userId) {
            await pool.query(
                `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`,
                [team.id, memberId]
            );
        }
    }

    if (initial_channel?.trim()) {
        await pool.query(
            `INSERT INTO team_channels (team_id, name, is_default, created_by) 
             VALUES ($1, $2, true, $3)`,
            [team.id, initial_channel.trim(), userId]
        );
    }

    return { success: true, data: team };
};

export const updateTeam = async (teamId, { name }) => {
    const result = await pool.query(
        `UPDATE teams SET name = $1 WHERE id = $2 RETURNING *`,
        [name, teamId]
    );

    return { success: true, data: result.rows[0] };
};

export const deleteTeam = async (teamId) => {
    await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
    return { success: true, message: 'Team deleted' };
};

export const addTeamMember = async (teamId, userId, memberId) => {
    const memberCheck = await pool.query(
        `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
        [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
    }

    await pool.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`,
        [teamId, memberId]
    );

    return { success: true, message: 'Member added' };
};

export const updateChannel = async (channelId, { name, description }) => {
    const result = await pool.query(
        `UPDATE team_channels SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
        [name, description || null, channelId]
    );

    return { success: true, data: result.rows[0] };
};

export const deleteChannel = async (channelId) => {
    await pool.query('DELETE FROM team_channels WHERE id = $1', [channelId]);
    return { success: true, message: 'Channel deleted' };
};

export const getTeamChannels = async (teamId, userId) => {
    const memberCheck = await pool.query(
        'SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
        const error = new Error('Not a team member');
        error.statusCode = 403;
        throw error;
    }

    await pool.query(`
        CREATE TABLE IF NOT EXISTS channel_last_read (
            channel_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            last_read_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (channel_id, user_id)
        )
    `);

    const result = await pool.query(
        `SELECT c.*,
               (SELECT COUNT(*) FROM channel_messages WHERE channel_id = c.id) as message_count,
               (SELECT COUNT(*) FROM channel_messages cm 
                WHERE cm.channel_id = c.id 
                AND cm.sender_id != $2
                AND cm.created_at > COALESCE(
                    (SELECT last_read_at FROM channel_last_read WHERE channel_id = c.id AND user_id = $2),
                    NOW()
                )) as unread_count
         FROM team_channels c
         WHERE c.team_id = $1
         ORDER BY c.is_default DESC, c.name`,
        [teamId, userId]
    );

    return { success: true, data: result.rows };
};

export const getChannelMessages = async (channelId, userId, { limit = 50, before }) => {
    const clearResult = await pool.query(
        'SELECT deleted_at FROM user_deleted_chats WHERE user_id = $1 AND channel_id = $2',
        [userId, channelId]
    );
    const clearedAt = clearResult.rows[0]?.deleted_at;

    let query = `
        SELECT m.*,
               u.name as sender_name,
               u.avatar as sender_avatar,
               COALESCE(
                   (SELECT json_agg(json_build_object('emoji', emoji, 'count', count::integer))
                    FROM (SELECT emoji, COUNT(*)::integer as count 
                          FROM message_reactions 
                          WHERE message_id = m.id AND message_type = 'channel'
                          GROUP BY emoji) r), 
                   '[]'::json
               ) as reactions,
               (SELECT COUNT(*) FROM channel_messages WHERE parent_id = m.id) as reply_count
        FROM channel_messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.channel_id = $1 AND m.is_deleted = false AND m.parent_id IS NULL
    `;

    const params = [channelId];

    if (clearedAt) {
        query += ` AND m.created_at > $${params.length + 1}`;
        params.push(clearedAt);
    }

    if (before) {
        query += ` AND m.created_at < $${params.length + 1}`;
        params.push(before);
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    for (const msg of result.rows) {
        await pool.query(
            `INSERT INTO message_read_receipts (message_id, user_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [msg.id, userId]
        );
    }

    return { success: true, data: result.rows.reverse() };
};

export const sendChannelMessage = async (channelId, userId, companyId, { content, reply_to, parentId, mentions, attachments, file_url, file_name, file_type, file_size }) => {
    if (!content?.trim() && !file_url) {
        const error = new Error('Message content required');
        error.statusCode = 400;
        throw error;
    }

    try {
        await pool.query(`
            ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
            ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
            ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);
            ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS file_size VARCHAR(50);
        `);
    } catch (e) { }

    const parent_id = reply_to || parentId || null;

    const result = await pool.query(
        `INSERT INTO channel_messages (channel_id, sender_id, content, parent_id, mentions, attachments, file_url, file_name, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [channelId, userId, content, parent_id, mentions || [], attachments || [], file_url || null, file_name || null, file_type || null, file_size || null]
    );

    const userInfo = await pool.query('SELECT name, avatar FROM users WHERE id = $1', [userId]);

    const message = {
        ...result.rows[0],
        sender_name: userInfo.rows[0]?.name,
        sender_avatar: userInfo.rows[0]?.avatar
    };

    const channelResult = await pool.query(
        'SELECT team_id FROM team_channels WHERE id = $1',
        [channelId]
    );
    const teamId = channelResult.rows[0]?.team_id;

    const membersResult = await pool.query(
        'SELECT user_id FROM team_members WHERE team_id = $1',
        [teamId]
    );

    for (const member of membersResult.rows) {
        if (member.user_id !== userId) {
            sendToUser(member.user_id, 'channel:message', { channelId: parseInt(channelId), message });
        }
    }

    return { success: true, data: message };
};

export const markChannelAsRead = async (channelId, userId) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS channel_last_read (
            channel_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            last_read_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (channel_id, user_id)
        )
    `);

    await pool.query(`
        INSERT INTO channel_last_read (channel_id, user_id, last_read_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (channel_id, user_id) DO UPDATE SET last_read_at = NOW()
    `, [channelId, userId]);

    return { success: true };
};

export const editChannelMessage = async (messageId, channelId, teamId, userId, { content }) => {
    if (!content?.trim()) {
        const error = new Error('Message content required');
        error.statusCode = 400;
        throw error;
    }

    const messageCheck = await pool.query(
        'SELECT sender_id FROM channel_messages WHERE id = $1',
        [messageId]
    );

    if (messageCheck.rows.length === 0) {
        const error = new Error('Message not found');
        error.statusCode = 404;
        throw error;
    }

    if (messageCheck.rows[0].sender_id !== userId) {
        const error = new Error('Not authorized to edit this message');
        error.statusCode = 403;
        throw error;
    }

    try {
        await pool.query(`
            ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT false;
            ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);
    } catch (e) { }

    const result = await pool.query(
        `UPDATE channel_messages 
         SET content = $1, edited = true, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [content, messageId]
    );

    const membersResult = await pool.query(
        'SELECT user_id FROM team_members WHERE team_id = $1',
        [teamId]
    );

    const editedMessage = result.rows[0];
    for (const member of membersResult.rows) {
        sendToUser(member.user_id, 'message:edited', {
            messageId: parseInt(messageId),
            channelId: parseInt(channelId),
            content: content,
            edited: true
        });
    }

    return { success: true, data: editedMessage };
};

export const deleteChannelMessage = async (messageId, channelId, teamId, userId) => {
    const messageCheck = await pool.query(
        'SELECT sender_id FROM channel_messages WHERE id = $1',
        [messageId]
    );

    if (messageCheck.rows.length === 0) {
        const error = new Error('Message not found');
        error.statusCode = 404;
        throw error;
    }

    if (messageCheck.rows[0].sender_id !== userId) {
        const error = new Error('Not authorized to delete this message');
        error.statusCode = 403;
        throw error;
    }

    await pool.query(
        `UPDATE channel_messages SET is_deleted = true WHERE id = $1`,
        [messageId]
    );

    const membersResult = await pool.query(
        'SELECT user_id FROM team_members WHERE team_id = $1',
        [teamId]
    );

    for (const member of membersResult.rows) {
        sendToUser(member.user_id, 'message:deleted', {
            messageId: parseInt(messageId),
            channelId: parseInt(channelId)
        });
    }

    return { success: true, message: 'Message deleted' };
};

export const reactToChannelMessage = async (messageId, channelId, userId, companyId, { emoji }) => {
    try {
        await pool.query(`
            ALTER TABLE message_reactions ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'channel';
        `);
    } catch (e) { }

    await pool.query(
        `INSERT INTO message_reactions (message_id, user_id, emoji, message_type)
         VALUES ($1, $2, $3, 'channel')
         ON CONFLICT (message_id, user_id, emoji) DO UPDATE SET message_type = 'channel'`,
        [messageId, userId, emoji]
    );

    const reactions = await pool.query(
        `SELECT emoji, COUNT(*)::integer as count 
         FROM message_reactions 
         WHERE message_id = $1 AND message_type = 'channel'
         GROUP BY emoji`,
        [messageId]
    );

    const channelResult = await pool.query(
        'SELECT team_id FROM team_channels WHERE id = $1',
        [channelId]
    );
    const teamId = channelResult.rows[0]?.team_id;

    const membersResult = await pool.query(
        'SELECT user_id FROM team_members WHERE team_id = $1',
        [teamId]
    );

    const reactionData = {
        messageId: parseInt(messageId),
        emoji,
        userId,
        reactions: reactions.rows.map(r => ({ emoji: r.emoji, count: parseInt(r.count) }))
    };

    for (const member of membersResult.rows) {
        sendToUser(member.user_id, 'message:reaction', reactionData);
    }

    return { success: true, data: reactions.rows };
};

export const removeChannelReaction = async (messageId, channelId, userId, companyId, { emoji }) => {
    await pool.query(
        `DELETE FROM message_reactions 
         WHERE message_id = $1 AND user_id = $2 AND emoji = $3 AND message_type = 'channel'`,
        [messageId, userId, emoji]
    );

    const reactions = await pool.query(
        `SELECT emoji, COUNT(*)::integer as count 
         FROM message_reactions 
         WHERE message_id = $1 AND message_type = 'channel'
         GROUP BY emoji`,
        [messageId]
    );

    const channelResult = await pool.query(
        'SELECT team_id FROM team_channels WHERE id = $1',
        [channelId]
    );
    const teamId = channelResult.rows[0]?.team_id;

    const membersResult = await pool.query(
        'SELECT user_id FROM team_members WHERE team_id = $1',
        [teamId]
    );

    const reactionData = {
        messageId: parseInt(messageId),
        emoji,
        userId,
        reactions: reactions.rows.map(r => ({ emoji: r.emoji, count: parseInt(r.count) }))
    };

    for (const member of membersResult.rows) {
        sendToUser(member.user_id, 'message:reaction', reactionData);
    }

    return { success: true, data: reactions.rows };
};

export const getChannelMessageReactions = async (messageId) => {
    const result = await pool.query(
        `SELECT mr.emoji, mr.user_id, u.name as user_name, u.avatar as user_avatar
         FROM message_reactions mr
         JOIN users u ON mr.user_id = u.id
         WHERE mr.message_id = $1 AND mr.message_type = 'channel'
         ORDER BY mr.created_at DESC`,
        [messageId]
    );

    return { success: true, data: result.rows };
};

export const createChannel = async (teamId, userId, { name, description, type = 'standard' }) => {
    const memberCheck = await pool.query(
        'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
        const error = new Error('Not a team member');
        error.statusCode = 403;
        throw error;
    }

    const result = await pool.query(
        `INSERT INTO team_channels (team_id, name, description, type, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [teamId, name, description, type, userId]
    );

    return { success: true, data: result.rows[0] };
};

export const getTeamMembers = async (teamId) => {
    const result = await pool.query(
        `SELECT tm.*, u.name, u.email, u.avatar, u.role as user_role
         FROM team_members tm
         JOIN users u ON tm.user_id = u.id
         WHERE tm.team_id = $1
         ORDER BY u.name`,
        [teamId]
    );

    return { success: true, data: result.rows };
};

export const getDirectMessageConversations = async (userId) => {
    const result = await pool.query(
        `WITH cleared_chats AS (
            SELECT chat_user_id, deleted_at
            FROM user_deleted_chats
            WHERE user_id = $1 AND chat_user_id IS NOT NULL
        ),
        conversations AS (
            SELECT DISTINCT 
                CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END as other_user_id,
                MAX(created_at) as last_activity
            FROM direct_messages
            WHERE (user1_id = $1 OR user2_id = $1)
            AND user1_id != user2_id
            GROUP BY other_user_id
        ),
        chat_list AS (
            SELECT DISTINCT ON (c.other_user_id)
                c.other_user_id,
                u.name as other_user_name,
                u.avatar as other_user_avatar,
                (SELECT content FROM direct_messages dm
                 WHERE ((dm.user1_id = $1 AND dm.user2_id = c.other_user_id) 
                    OR (dm.user2_id = $1 AND dm.user1_id = c.other_user_id))
                 AND (cc.deleted_at IS NULL OR dm.created_at > cc.deleted_at)
                 ORDER BY dm.created_at DESC LIMIT 1) as last_message,
                (SELECT file_type FROM direct_messages dm
                 WHERE ((dm.user1_id = $1 AND dm.user2_id = c.other_user_id) 
                    OR (dm.user2_id = $1 AND dm.user1_id = c.other_user_id))
                 AND (cc.deleted_at IS NULL OR dm.created_at > cc.deleted_at)
                 ORDER BY dm.created_at DESC LIMIT 1) as last_message_file_type,
                (SELECT created_at FROM direct_messages dm
                 WHERE ((dm.user1_id = $1 AND dm.user2_id = c.other_user_id) 
                    OR (dm.user2_id = $1 AND dm.user1_id = c.other_user_id))
                 AND (cc.deleted_at IS NULL OR dm.created_at > cc.deleted_at)
                 ORDER BY dm.created_at DESC LIMIT 1) as last_message_at,
                (SELECT sender_id FROM direct_messages dm
                 WHERE ((dm.user1_id = $1 AND dm.user2_id = c.other_user_id) 
                    OR (dm.user2_id = $1 AND dm.user1_id = c.other_user_id))
                 AND (cc.deleted_at IS NULL OR dm.created_at > cc.deleted_at)
                 ORDER BY dm.created_at DESC LIMIT 1) as last_sender_id,
                (SELECT is_read FROM direct_messages dm
                 WHERE ((dm.user1_id = $1 AND dm.user2_id = c.other_user_id) 
                    OR (dm.user2_id = $1 AND dm.user1_id = c.other_user_id))
                 AND (cc.deleted_at IS NULL OR dm.created_at > cc.deleted_at)
                 ORDER BY dm.created_at DESC LIMIT 1) as last_message_read,
                (SELECT is_delivered FROM direct_messages dm
                 WHERE ((dm.user1_id = $1 AND dm.user2_id = c.other_user_id) 
                    OR (dm.user2_id = $1 AND dm.user1_id = c.other_user_id))
                 AND (cc.deleted_at IS NULL OR dm.created_at > cc.deleted_at)
                 ORDER BY dm.created_at DESC LIMIT 1) as last_message_delivered,
                (SELECT COUNT(*) FROM direct_messages dm
                 WHERE ((dm.user1_id = $1 AND dm.user2_id = c.other_user_id) 
                    OR (dm.user2_id = $1 AND dm.user1_id = c.other_user_id))
                 AND dm.sender_id = c.other_user_id 
                 AND dm.is_read = false
                 AND (cc.deleted_at IS NULL OR dm.created_at > cc.deleted_at)) as unread_count
            FROM conversations c
            JOIN users u ON u.id = c.other_user_id
            LEFT JOIN cleared_chats cc ON cc.chat_user_id = c.other_user_id
            WHERE c.other_user_id != $1
            ORDER BY c.other_user_id
        )
        SELECT * FROM chat_list
        ORDER BY last_message_at DESC NULLS LAST`,
        [userId]
    );

    return { success: true, data: result.rows };
};

export const getDirectMessageHistory = async (userId, otherUserId, { limit = 50, before }) => {
    const clearResult = await pool.query(
        'SELECT deleted_at FROM user_deleted_chats WHERE user_id = $1 AND chat_user_id = $2',
        [userId, otherUserId]
    );
    const clearedAt = clearResult.rows[0]?.deleted_at;

    // Fetch regular messages
    let msgQuery = `
        SELECT dm.*, 
               u.name as sender_name, 
               u.avatar as sender_avatar,
               'message' as message_type,
               COALESCE(
                   (SELECT json_agg(json_build_object('emoji', emoji, 'count', count::integer))
                    FROM (SELECT emoji, COUNT(*)::integer as count 
                          FROM message_reactions 
                          WHERE message_id = dm.id AND message_type = 'direct'
                          GROUP BY emoji) r),
                   '[]'::json
               ) as reactions
        FROM direct_messages dm
        JOIN users u ON dm.sender_id = u.id
        WHERE ((dm.user1_id = $1 AND dm.user2_id = $2) 
           OR (dm.user1_id = $2 AND dm.user2_id = $1))
    `;

    const msgParams = [userId, otherUserId];

    if (clearedAt) {
        msgQuery += ` AND dm.created_at > $${msgParams.length + 1}`;
        msgParams.push(clearedAt);
    }

    if (before) {
        msgQuery += ` AND dm.created_at < $${msgParams.length + 1}`;
        msgParams.push(before);
    }

    msgQuery += ` ORDER BY dm.created_at DESC LIMIT $${msgParams.length + 1}`;
    msgParams.push(limit);

    const msgResult = await pool.query(msgQuery, msgParams);

    // Fetch call history between these two users
    let callQuery = `
        SELECT 
            ch.id,
            ch.caller_id,
            ch.receiver_id,
            ch.call_type,
            ch.status,
            ch.duration_seconds,
            ch.started_at as created_at,
            ch.ended_at,
            'call' as message_type,
            caller.name as caller_name,
            caller.avatar as caller_avatar,
            receiver.name as receiver_name,
            receiver.avatar as receiver_avatar
        FROM call_history ch
        LEFT JOIN users caller ON ch.caller_id = caller.id
        LEFT JOIN users receiver ON ch.receiver_id = receiver.id
        WHERE ((ch.caller_id = $1 AND ch.receiver_id = $2) 
           OR (ch.caller_id = $2 AND ch.receiver_id = $1))
        AND ch.status IN ('completed', 'declined', 'missed')
    `;

    const callParams = [userId, otherUserId];

    if (clearedAt) {
        callQuery += ` AND ch.started_at > $${callParams.length + 1}`;
        callParams.push(clearedAt);
    }

    if (before) {
        callQuery += ` AND ch.started_at < $${callParams.length + 1}`;
        callParams.push(before);
    }

    callQuery += ` ORDER BY ch.started_at DESC LIMIT $${callParams.length + 1}`;
    callParams.push(limit);

    let callResult = { rows: [] };
    try {
        // Try to fetch call history - table may not exist yet
        callResult = await pool.query(callQuery, callParams);
    } catch (err) {
        // Ignore if call_history table doesn't exist
        console.log('Call history table may not exist yet:', err.message);
    }

    // Merge messages and calls, then sort by created_at
    const allItems = [...msgResult.rows, ...callResult.rows];
    allItems.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Take only the last 'limit' items
    const limitedItems = allItems.slice(-limit);

    return { success: true, data: limitedItems };
};

export const searchUsers = async (companyId, userId, searchQuery) => {
    let result;
    if (!searchQuery || searchQuery.length < 1) {
        result = await pool.query(
            `SELECT id, name, email, avatar, role 
             FROM users 
             WHERE company_id = $1 AND id != $2
             ORDER BY name
             LIMIT 50`,
            [companyId, userId]
        );
    } else {
        result = await pool.query(
            `SELECT id, name, email, avatar, role 
             FROM users 
             WHERE company_id = $1 AND id != $2 
             AND (name ILIKE $3 OR email ILIKE $3)
             ORDER BY name
             LIMIT 20`,
            [companyId, userId, `%${searchQuery}%`]
        );
    }

    return { success: true, data: result.rows };
};

export const sendDirectMessage = async (userId, companyId, otherUserId, { content, reply_to, file_url, file_name, file_type, file_size }) => {
    if (!content?.trim() && !file_url) {
        const error = new Error('Message required');
        error.statusCode = 400;
        throw error;
    }

    const [user1, user2] = [userId, parseInt(otherUserId)].sort((a, b) => a - b);

    const senderResult = await pool.query('SELECT name, avatar FROM users WHERE id = $1', [userId]);
    const sender = senderResult.rows[0] || {};

    try {
        await pool.query(`
            ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
            ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
            ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);
            ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS file_size VARCHAR(50);
            ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS reply_to INTEGER;
        `);
    } catch (e) { }

    const result = await pool.query(
        `INSERT INTO direct_messages (company_id, user1_id, user2_id, sender_id, content, reply_to, file_url, file_name, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [companyId, user1, user2, userId, content, reply_to || null, file_url || null, file_name || null, file_type || null, file_size || null]
    );

    const message = {
        ...result.rows[0],
        sender_name: sender.name,
        sender_avatar: sender.avatar
    };

    sendToUser(parseInt(otherUserId), 'direct:message', message);

    return { success: true, data: message };
};

export const markDirectMessagesAsRead = async (userId, otherUserId) => {
    const [user1, user2] = [userId, parseInt(otherUserId)].sort((a, b) => a - b);

    await pool.query(
        `UPDATE direct_messages 
         SET is_read = true 
         WHERE user1_id = $1 AND user2_id = $2 
         AND sender_id = $3 AND is_read = false`,
        [user1, user2, parseInt(otherUserId)]
    );

    sendToUser(parseInt(otherUserId), 'message:read', {
        reader_id: userId,
        chat_with: parseInt(otherUserId)
    });

    return { success: true, message: 'Messages marked as read' };
};

export const markDirectMessagesAsDelivered = async (userId, otherUserId) => {
    await pool.query(
        `UPDATE direct_messages 
         SET is_delivered = true 
         WHERE sender_id = $1 
         AND (user1_id = $2 OR user2_id = $2)
         AND is_delivered = false`,
        [otherUserId, userId]
    );

    sendToUser(parseInt(otherUserId), 'message:delivered', {
        receiver_id: userId
    });

    return { success: true };
};

export const reactToDirectMessage = async (messageId, userId, companyId, otherUserId, { emoji }) => {
    try {
        await pool.query(`
            ALTER TABLE message_reactions ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'channel';
        `);
    } catch (e) { }

    await pool.query(
        `INSERT INTO message_reactions (message_id, user_id, emoji, message_type)
         VALUES ($1, $2, $3, 'direct')
         ON CONFLICT (message_id, user_id, emoji) DO UPDATE SET message_type = 'direct'`,
        [messageId, userId, emoji]
    );

    const reactions = await pool.query(
        `SELECT emoji, COUNT(*)::integer as count 
         FROM message_reactions 
         WHERE message_id = $1 AND message_type = 'direct'
         GROUP BY emoji`,
        [messageId]
    );

    const reactionData = {
        messageId: parseInt(messageId),
        emoji,
        userId,
        reactions: reactions.rows.map(r => ({ emoji: r.emoji, count: parseInt(r.count) }))
    };
    sendToUser(userId, 'message:reaction', reactionData);
    sendToUser(parseInt(otherUserId), 'message:reaction', reactionData);

    return { success: true, data: reactions.rows };
};

export const getDirectMessageReactions = async (messageId) => {
    const reactions = await pool.query(
        `SELECT mr.emoji, mr.user_id, mr.created_at,
                u.name as user_name, u.email as user_email, u.avatar as user_avatar
         FROM message_reactions mr
         JOIN users u ON mr.user_id = u.id
         WHERE mr.message_id = $1 AND mr.message_type = 'direct'
         ORDER BY mr.created_at ASC`,
        [messageId]
    );

    return { success: true, data: reactions.rows };
};

export const removeDirectMessageReaction = async (messageId, userId, otherUserId, { emoji }) => {
    await pool.query(
        `DELETE FROM message_reactions 
         WHERE message_id = $1 AND user_id = $2 AND emoji = $3 AND message_type = 'direct'`,
        [messageId, userId, emoji]
    );

    const reactions = await pool.query(
        `SELECT emoji, COUNT(*)::integer as count 
         FROM message_reactions 
         WHERE message_id = $1 AND message_type = 'direct'
         GROUP BY emoji`,
        [messageId]
    );

    const reactionData = {
        messageId: parseInt(messageId),
        emoji,
        userId,
        reactions: reactions.rows.map(r => ({ emoji: r.emoji, count: parseInt(r.count) }))
    };
    sendToUser(userId, 'message:reaction', reactionData);
    sendToUser(parseInt(otherUserId), 'message:reaction', reactionData);

    return { success: true, data: reactions.rows };
};

export const editDirectMessage = async (messageId, userId, otherUserId, { content }) => {
    if (!content?.trim()) {
        const error = new Error('Message content required');
        error.statusCode = 400;
        throw error;
    }

    const messageCheck = await pool.query(
        'SELECT sender_id FROM direct_messages WHERE id = $1',
        [messageId]
    );

    if (messageCheck.rows.length === 0) {
        const error = new Error('Message not found');
        error.statusCode = 404;
        throw error;
    }

    if (messageCheck.rows[0].sender_id !== userId) {
        const error = new Error('Not authorized to edit this message');
        error.statusCode = 403;
        throw error;
    }

    try {
        await pool.query(`
            ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT false;
            ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);
    } catch (e) { }

    const result = await pool.query(
        `UPDATE direct_messages 
         SET content = $1, edited = true, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [content, messageId]
    );

    sendToUser(parseInt(otherUserId), 'message:edited', {
        messageId: parseInt(messageId),
        chatUserId: userId,
        content: content,
        edited: true
    });

    sendToUser(userId, 'message:edited', {
        messageId: parseInt(messageId),
        chatUserId: parseInt(otherUserId),
        content: content,
        edited: true
    });

    return { success: true, data: result.rows[0] };
};

export const deleteDirectMessage = async (messageId, userId, otherUserId) => {
    const messageCheck = await pool.query(
        'SELECT sender_id FROM direct_messages WHERE id = $1',
        [messageId]
    );

    if (messageCheck.rows.length === 0) {
        const error = new Error('Message not found');
        error.statusCode = 404;
        throw error;
    }

    if (messageCheck.rows[0].sender_id !== userId) {
        const error = new Error('Not authorized to delete this message');
        error.statusCode = 403;
        throw error;
    }

    await pool.query(
        `DELETE FROM direct_messages WHERE id = $1`,
        [messageId]
    );

    sendToUser(parseInt(otherUserId), 'message:deleted', {
        messageId: parseInt(messageId),
        chatUserId: userId
    });

    sendToUser(userId, 'message:deleted', {
        messageId: parseInt(messageId),
        chatUserId: parseInt(otherUserId)
    });

    return { success: true, message: 'Message deleted' };
};

export const clearDirectMessageChat = async (userId, otherUserId) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_deleted_chats (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            chat_user_id INTEGER,
            channel_id INTEGER,
            deleted_at TIMESTAMP DEFAULT NOW()
        )
    `);

    await pool.query(
        `DELETE FROM user_deleted_chats 
         WHERE user_id = $1 AND chat_user_id = $2`,
        [userId, parseInt(otherUserId)]
    );

    await pool.query(
        `INSERT INTO user_deleted_chats (user_id, chat_user_id, deleted_at) 
         VALUES ($1, $2, NOW())`,
        [userId, parseInt(otherUserId)]
    );

    return { success: true, message: 'Chat cleared for you' };
};

export const deleteDirectMessageChat = async (userId, otherUserId) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_deleted_chats (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            chat_user_id INTEGER,
            channel_id INTEGER,
            deleted_at TIMESTAMP DEFAULT NOW()
        )
    `);

    await pool.query(
        `DELETE FROM user_deleted_chats 
         WHERE user_id = $1 AND chat_user_id = $2`,
        [userId, parseInt(otherUserId)]
    );

    await pool.query(
        `INSERT INTO user_deleted_chats (user_id, chat_user_id, deleted_at) 
         VALUES ($1, $2, NOW())`,
        [userId, parseInt(otherUserId)]
    );

    return { success: true, message: 'Chat deleted for you' };
};

export const clearChannel = async (userId, channelId) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_deleted_chats (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            chat_user_id INTEGER,
            channel_id INTEGER,
            deleted_at TIMESTAMP DEFAULT NOW()
        )
    `);

    await pool.query(
        `DELETE FROM user_deleted_chats 
         WHERE user_id = $1 AND channel_id = $2`,
        [userId, parseInt(channelId)]
    );

    await pool.query(
        `INSERT INTO user_deleted_chats (user_id, channel_id, deleted_at) 
         VALUES ($1, $2, NOW())`,
        [userId, parseInt(channelId)]
    );

    return { success: true, message: 'Channel cleared for you' };
};
