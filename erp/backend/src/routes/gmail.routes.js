// src/routes/gmail.routes.js - Gmail Integration Routes
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as controller from '../controllers/gmailController.js';

const router = express.Router();

// OAuth callback (no auth - redirected from Google)
router.get('/callback', controller.handleCallback);

// All other routes require authentication
router.use(authMiddleware);

// Get auth URL to connect Gmail
router.get('/auth-url', controller.getAuthUrl);

// Get connection status
router.get('/status', controller.getStatus);

// Disconnect Gmail
router.delete('/disconnect', controller.disconnect);

// List emails
router.get('/emails', controller.listEmails);

// Get single email
router.get('/emails/:messageId', controller.getEmail);

// Send email
router.post('/send', controller.sendEmail);

// Search emails by contact
router.get('/search', controller.searchByContact);

export default router;
