// src/controllers/gmailController.js - Gmail Integration Controller
import * as gmailService from '../services/gmailService.js';

/**
 * Get Gmail auth URL
 * GET /api/gmail/auth-url
 */
export async function getAuthUrl(req, res) {
    try {
        const userId = req.user?.userId;
        const authUrl = gmailService.getAuthUrl(userId);
        res.json({ success: true, authUrl });
    } catch (error) {
        console.error('Get auth URL error:', error);
        res.status(500).json({ success: false, message: 'Failed to get auth URL' });
    }
}

/**
 * Handle OAuth callback
 * GET /api/gmail/callback
 */
export async function handleCallback(req, res) {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Authorization code required' });
        }

        // Parse state to get userId
        let userId;
        try {
            const stateData = JSON.parse(state);
            userId = stateData.userId;
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid state' });
        }

        // Exchange code for tokens
        const tokens = await gmailService.exchangeCodeForTokens(code);

        // Save tokens
        await gmailService.saveUserTokens(userId, tokens);

        // Redirect to settings page with success
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/email?connected=true`);
    } catch (error) {
        console.error('Gmail callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/email?error=connection_failed`);
    }
}

/**
 * Get connection status
 * GET /api/gmail/status
 */
export async function getStatus(req, res) {
    try {
        const userId = req.user?.userId;
        const isConnected = await gmailService.isGmailConnected(userId);

        let profile = null;
        if (isConnected) {
            try {
                profile = await gmailService.getProfile(userId);
            } catch (err) {
                // Token might be invalid
                console.error('Profile fetch failed:', err);
            }
        }

        res.json({
            success: true,
            isConnected,
            profile
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ success: false, message: 'Failed to get status' });
    }
}

/**
 * Disconnect Gmail
 * DELETE /api/gmail/disconnect
 */
export async function disconnect(req, res) {
    try {
        const userId = req.user?.userId;
        await gmailService.disconnectGmail(userId);
        res.json({ success: true, message: 'Gmail disconnected' });
    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({ success: false, message: 'Failed to disconnect' });
    }
}

/**
 * List emails
 * GET /api/gmail/emails
 */
export async function listEmails(req, res) {
    try {
        const userId = req.user?.userId;
        const { limit = 20, query, pageToken } = req.query;

        const result = await gmailService.listEmails(userId, {
            maxResults: parseInt(limit),
            query,
            pageToken
        });

        res.json({ success: true, ...result });
    } catch (error) {
        console.error('List emails error:', error);
        if (error.message === 'Gmail not connected') {
            return res.status(401).json({ success: false, message: 'Gmail not connected' });
        }
        res.status(500).json({ success: false, message: 'Failed to list emails' });
    }
}

/**
 * Get single email
 * GET /api/gmail/emails/:messageId
 */
export async function getEmail(req, res) {
    try {
        const userId = req.user?.userId;
        const { messageId } = req.params;

        const email = await gmailService.getEmail(userId, messageId);
        res.json({ success: true, email });
    } catch (error) {
        console.error('Get email error:', error);
        res.status(500).json({ success: false, message: 'Failed to get email' });
    }
}

/**
 * Send email
 * POST /api/gmail/send
 */
export async function sendEmail(req, res) {
    try {
        const userId = req.user?.userId;
        const { to, subject, body, cc, bcc } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({
                success: false,
                message: 'To, subject, and body are required'
            });
        }

        const result = await gmailService.sendEmail(userId, { to, subject, body, cc, bcc });
        res.json({ success: true, messageId: result.id });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
}

/**
 * Search emails by contact
 * GET /api/gmail/search
 */
export async function searchByContact(req, res) {
    try {
        const userId = req.user?.userId;
        const { email, limit = 10 } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const result = await gmailService.searchEmailsByContact(userId, email, parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Search emails error:', error);
        res.status(500).json({ success: false, message: 'Failed to search emails' });
    }
}

export default {
    getAuthUrl,
    handleCallback,
    getStatus,
    disconnect,
    listEmails,
    getEmail,
    sendEmail,
    searchByContact
};
