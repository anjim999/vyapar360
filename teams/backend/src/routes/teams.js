// src/routes/teams.js - Microsoft Teams-like Chat API
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as chatController from '../controllers/chat/chatController.js';

const router = express.Router();

// Debug
router.get('/debug/triggers', authMiddleware, chatController.getDebugTriggers);

// Teams
router.get('/', authMiddleware, chatController.getAllTeams);
router.post('/', authMiddleware, chatController.createTeam);
router.put('/:teamId', authMiddleware, chatController.updateTeam);
router.delete('/:teamId', authMiddleware, chatController.deleteTeam);

// Team Members
router.post('/:teamId/members', authMiddleware, chatController.addTeamMember);
router.get('/:teamId/members', authMiddleware, chatController.getTeamMembers);

// Channels
router.get('/:teamId/channels', authMiddleware, chatController.getTeamChannels);
router.post('/:teamId/channels', authMiddleware, chatController.createChannel);
router.put('/:teamId/channels/:channelId', authMiddleware, chatController.updateChannel);
router.delete('/:teamId/channels/:channelId', authMiddleware, chatController.deleteChannel);

// Channel Messages
router.get('/:teamId/channels/:channelId/messages', authMiddleware, chatController.getChannelMessages);
router.post('/:teamId/channels/:channelId/messages', authMiddleware, chatController.sendChannelMessage);
router.post('/:teamId/channels/:channelId/read', authMiddleware, chatController.markChannelAsRead);
router.put('/:teamId/channels/:channelId/messages/:messageId', authMiddleware, chatController.editChannelMessage);
router.delete('/:teamId/channels/:channelId/messages/:messageId', authMiddleware, chatController.deleteChannelMessage);

// Channel Message Reactions
router.post('/:teamId/channels/:channelId/messages/:messageId/react', authMiddleware, chatController.reactToChannelMessage);
router.delete('/:teamId/channels/:channelId/messages/:messageId/react', authMiddleware, chatController.removeChannelReaction);
router.get('/:teamId/channels/:channelId/messages/:messageId/reactions', authMiddleware, chatController.getChannelMessageReactions);

// Channel Clear
router.delete('/:teamId/channels/:channelId/clear', authMiddleware, chatController.clearChannel);

// Direct Messages
router.get('/direct-messages', authMiddleware, chatController.getDirectMessageConversations);
router.get('/direct-messages/:otherUserId', authMiddleware, chatController.getDirectMessageHistory);
router.post('/direct-messages/:otherUserId', authMiddleware, chatController.sendDirectMessage);
router.post('/direct-messages/:otherUserId/read', authMiddleware, chatController.markDirectMessagesAsRead);
router.post('/direct-messages/:otherUserId/delivered', authMiddleware, chatController.markDirectMessagesAsDelivered);

// Direct Message Reactions
router.post('/direct-messages/:otherUserId/messages/:messageId/react', authMiddleware, chatController.reactToDirectMessage);
router.get('/direct-messages/:otherUserId/messages/:messageId/reactions', authMiddleware, chatController.getDirectMessageReactions);
router.delete('/direct-messages/:otherUserId/messages/:messageId/react', authMiddleware, chatController.removeDirectMessageReaction);

// Direct Message Edit/Delete
router.put('/direct-messages/:otherUserId/messages/:messageId', authMiddleware, chatController.editDirectMessage);
router.delete('/direct-messages/:otherUserId/messages/:messageId', authMiddleware, chatController.deleteDirectMessage);

// Direct Message Clear/Delete Chat
router.delete('/direct-messages/:otherUserId/clear', authMiddleware, chatController.clearDirectMessageChat);
router.delete('/direct-messages/:otherUserId/delete', authMiddleware, chatController.deleteDirectMessageChat);

// Users Search
router.get('/users/search', authMiddleware, chatController.searchUsers);

export default router;
