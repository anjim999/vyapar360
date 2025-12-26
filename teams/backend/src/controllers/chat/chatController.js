// backend/src/controllers/chatController.js
import * as chatService from '../../services/chatService.js';

export const getDebugTriggers = async (req, res) => {
    try {
        const result = await chatService.getDebugTriggers();
        res.json(result);
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
};

export const getAllTeams = async (req, res) => {
    try {
        const { userId, companyId } = req.user;
        const result = await chatService.getAllTeams(userId, companyId);
        res.json(result);
    } catch (err) {
        console.error('Get teams error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch teams' });
    }
};

export const createTeam = async (req, res) => {
    try {
        const { userId, companyId } = req.user;
        const { name, type, members, initial_channel } = req.body;
        const result = await chatService.createTeam(userId, companyId, { name, type, members, initial_channel });
        res.status(201).json(result);
    } catch (err) {
        console.error('Create team error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to create team' });
    }
};

export const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name } = req.body;
        const result = await chatService.updateTeam(teamId, { name });
        res.json(result);
    } catch (err) {
        console.error('Update team error:', err);
        res.status(500).json({ success: false, error: 'Failed to update team' });
    }
};

export const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const result = await chatService.deleteTeam(teamId);
        res.json(result);
    } catch (err) {
        console.error('Delete team error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete team' });
    }
};

export const addTeamMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.user;
        const { memberId } = req.body;
        const result = await chatService.addTeamMember(teamId, userId, memberId);
        res.json(result);
    } catch (err) {
        console.error('Add member error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to add member' });
    }
};

export const updateChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { name, description } = req.body;
        const result = await chatService.updateChannel(channelId, { name, description });
        res.json(result);
    } catch (err) {
        console.error('Update channel error:', err);
        res.status(500).json({ success: false, error: 'Failed to update channel' });
    }
};

export const deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const result = await chatService.deleteChannel(channelId);
        res.json(result);
    } catch (err) {
        console.error('Delete channel error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete channel' });
    }
};

export const getTeamChannels = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.user;
        const result = await chatService.getTeamChannels(teamId, userId);
        res.json(result);
    } catch (err) {
        console.error('Get channels error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to fetch channels' });
    }
};

export const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId } = req.user;
        const { limit, before } = req.query;
        const result = await chatService.getChannelMessages(channelId, userId, { limit, before });
        res.json(result);
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
};

export const sendChannelMessage = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId, companyId } = req.user;
        const { content, reply_to, parentId, mentions, attachments, file_url, file_name, file_type, file_size } = req.body;
        const result = await chatService.sendChannelMessage(channelId, userId, companyId, { content, reply_to, parentId, mentions, attachments, file_url, file_name, file_type, file_size });
        res.status(201).json(result);
    } catch (err) {
        console.error('Send message error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to send message' });
    }
};

export const markChannelAsRead = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId } = req.user;
        const result = await chatService.markChannelAsRead(channelId, userId);
        res.json(result);
    } catch (err) {
        console.error('Mark channel read error:', err);
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

export const editChannelMessage = async (req, res) => {
    try {
        const { messageId, channelId, teamId } = req.params;
        const { userId } = req.user;
        const { content } = req.body;
        const result = await chatService.editChannelMessage(messageId, channelId, teamId, userId, { content });
        res.json(result);
    } catch (err) {
        console.error('Edit message error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to edit message' });
    }
};

export const deleteChannelMessage = async (req, res) => {
    try {
        const { messageId, channelId, teamId } = req.params;
        const { userId } = req.user;
        const result = await chatService.deleteChannelMessage(messageId, channelId, teamId, userId);
        res.json(result);
    } catch (err) {
        console.error('Delete message error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to delete message' });
    }
};

export const reactToChannelMessage = async (req, res) => {
    try {
        const { messageId, channelId } = req.params;
        const { userId, companyId } = req.user;
        const { emoji } = req.body;
        const result = await chatService.reactToChannelMessage(messageId, channelId, userId, companyId, { emoji });
        res.json(result);
    } catch (err) {
        console.error('React error:', err);
        res.status(500).json({ success: false, error: 'Failed to add reaction' });
    }
};

export const removeChannelReaction = async (req, res) => {
    try {
        const { messageId, channelId } = req.params;
        const { userId, companyId } = req.user;
        const { emoji } = req.body;
        const result = await chatService.removeChannelReaction(messageId, channelId, userId, companyId, { emoji });
        res.json(result);
    } catch (err) {
        console.error('Remove reaction error:', err);
        res.status(500).json({ success: false, error: 'Failed to remove reaction' });
    }
};

export const getChannelMessageReactions = async (req, res) => {
    try {
        const { messageId } = req.params;
        const result = await chatService.getChannelMessageReactions(messageId);
        res.json(result);
    } catch (err) {
        console.error('Get channel reactions error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch reactions' });
    }
};

export const createChannel = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.user;
        const { name, description, type } = req.body;
        const result = await chatService.createChannel(teamId, userId, { name, description, type });
        res.status(201).json(result);
    } catch (err) {
        console.error('Create channel error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to create channel' });
    }
};

export const getTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const result = await chatService.getTeamMembers(teamId);
        res.json(result);
    } catch (err) {
        console.error('Get members error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch members' });
    }
};

export const getDirectMessageConversations = async (req, res) => {
    try {
        const { userId } = req.user;
        const result = await chatService.getDirectMessageConversations(userId);
        res.json(result);
    } catch (err) {
        console.error('Get DMs error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
};

export const getDirectMessageHistory = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { userId } = req.user;
        const { limit, before } = req.query;
        const result = await chatService.getDirectMessageHistory(userId, otherUserId, { limit, before });
        res.json(result);
    } catch (err) {
        console.error('Get DM history error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { companyId, userId } = req.user;
        const { query } = req.query;
        const result = await chatService.searchUsers(companyId, userId, query);
        res.json(result);
    } catch (err) {
        console.error('Search users error:', err);
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

export const sendDirectMessage = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { userId, companyId } = req.user;
        const { content, reply_to, file_url, file_name, file_type, file_size } = req.body;
        const result = await chatService.sendDirectMessage(userId, companyId, otherUserId, { content, reply_to, file_url, file_name, file_type, file_size });
        res.status(201).json(result);
    } catch (err) {
        console.error('Send DM error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to send message' });
    }
};

export const markDirectMessagesAsRead = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { userId } = req.user;
        const result = await chatService.markDirectMessagesAsRead(userId, otherUserId);
        res.json(result);
    } catch (err) {
        console.error('Mark as read error:', err);
        res.status(500).json({ success: false, error: 'Failed to mark as read' });
    }
};

export const markDirectMessagesAsDelivered = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { userId } = req.user;
        const result = await chatService.markDirectMessagesAsDelivered(userId, otherUserId);
        res.json(result);
    } catch (err) {
        console.error('Delivered notification error:', err);
        res.status(500).json({ success: false, error: 'Failed to notify' });
    }
};

export const reactToDirectMessage = async (req, res) => {
    try {
        const { messageId, otherUserId } = req.params;
        const { userId, companyId } = req.user;
        const { emoji } = req.body;
        const result = await chatService.reactToDirectMessage(messageId, userId, companyId, otherUserId, { emoji });
        res.json(result);
    } catch (err) {
        console.error('React to DM error:', err);
        res.status(500).json({ success: false, error: 'Failed to add reaction' });
    }
};

export const getDirectMessageReactions = async (req, res) => {
    try {
        const { messageId } = req.params;
        const result = await chatService.getDirectMessageReactions(messageId);
        res.json(result);
    } catch (err) {
        console.error('Get DM reactions error:', err);
        res.status(500).json({ success: false, error: 'Failed to get reactions' });
    }
};

export const removeDirectMessageReaction = async (req, res) => {
    try {
        const { messageId, otherUserId } = req.params;
        const { userId } = req.user;
        const { emoji } = req.body;
        const result = await chatService.removeDirectMessageReaction(messageId, userId, otherUserId, { emoji });
        res.json(result);
    } catch (err) {
        console.error('Remove DM reaction error:', err);
        res.status(500).json({ success: false, error: 'Failed to remove reaction' });
    }
};

export const editDirectMessage = async (req, res) => {
    try {
        const { messageId, otherUserId } = req.params;
        const { userId } = req.user;
        const { content } = req.body;
        const result = await chatService.editDirectMessage(messageId, userId, otherUserId, { content });
        res.json(result);
    } catch (err) {
        console.error('Edit DM error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to edit message' });
    }
};

export const deleteDirectMessage = async (req, res) => {
    try {
        const { messageId, otherUserId } = req.params;
        const { userId } = req.user;
        const result = await chatService.deleteDirectMessage(messageId, userId, otherUserId);
        res.json(result);
    } catch (err) {
        console.error('Delete DM error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Failed to delete message' });
    }
};

export const clearDirectMessageChat = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { userId } = req.user;
        const result = await chatService.clearDirectMessageChat(userId, otherUserId);
        res.json(result);
    } catch (err) {
        console.error('Clear DM error:', err);
        res.status(500).json({ success: false, error: 'Failed to clear chat' });
    }
};

export const deleteDirectMessageChat = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { userId } = req.user;
        const result = await chatService.deleteDirectMessageChat(userId, otherUserId);
        res.json(result);
    } catch (err) {
        console.error('Delete chat error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete chat' });
    }
};

export const clearChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId } = req.user;
        const result = await chatService.clearChannel(userId, channelId);
        res.json(result);
    } catch (err) {
        console.error('Clear channel error:', err);
        res.status(500).json({ success: false, error: 'Failed to clear channel' });
    }
};
