// src/services/gmailService.js - Gmail Integration Service
import { google } from 'googleapis';
import { query } from '../db/pool.js';

// OAuth2 Configuration
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.labels'
];

/**
 * Create OAuth2 client
 */
export function createOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/settings/email/callback`
    );
}


 // Get authorization URL for user to connect Gmail
 
export function getAuthUrl(userId) {
    const oauth2Client = createOAuth2Client();

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: JSON.stringify({ userId }),
        prompt: 'consent'
    });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code) {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

/**
 * Save tokens to database
 */
export async function saveUserTokens(userId, tokens) {
    // Check if integration exists
    const existing = await query(
        `SELECT id FROM email_integrations WHERE user_id = $1 AND provider = 'gmail'`,
        [userId]
    );

    if (existing.rows.length > 0) {
        await query(
            `UPDATE email_integrations 
       SET access_token = $1, refresh_token = $2, expiry_date = $3, updated_at = NOW()
       WHERE user_id = $4 AND provider = 'gmail'`,
            [tokens.access_token, tokens.refresh_token, tokens.expiry_date ? new Date(tokens.expiry_date) : null, userId]
        );
    } else {
        await query(
            `INSERT INTO email_integrations (user_id, provider, access_token, refresh_token, expiry_date)
       VALUES ($1, 'gmail', $2, $3, $4)`,
            [userId, tokens.access_token, tokens.refresh_token, tokens.expiry_date ? new Date(tokens.expiry_date) : null]
        );
    }
}

/**
 * Get user tokens from database
 */
export async function getUserTokens(userId) {
    const result = await query(
        `SELECT * FROM email_integrations WHERE user_id = $1 AND provider = 'gmail'`,
        [userId]
    );
    return result.rows[0];
}

/**
 * Get authenticated Gmail client for a user
 */
export async function getGmailClient(userId) {
    const integration = await getUserTokens(userId);

    if (!integration) {
        throw new Error('Gmail not connected');
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
        expiry_date: integration.expiry_date
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            await saveUserTokens(userId, tokens);
        }
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Get user's profile info
 */
export async function getProfile(userId) {
    const gmail = await getGmailClient(userId);
    const res = await gmail.users.getProfile({ userId: 'me' });
    return res.data;
}

/**
 * List emails from inbox
 */
export async function listEmails(userId, options = {}) {
    const gmail = await getGmailClient(userId);
    const { maxResults = 20, query: searchQuery = '', pageToken } = options;

    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: searchQuery,
        pageToken
    });

    if (!res.data.messages) {
        return { messages: [], nextPageToken: null };
    }

    // Fetch full details for each message
    const messages = await Promise.all(
        res.data.messages.map(async (msg) => {
            const detail = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'metadata',
                metadataHeaders: ['From', 'To', 'Subject', 'Date']
            });
            return parseEmailMetadata(detail.data);
        })
    );

    return {
        messages,
        nextPageToken: res.data.nextPageToken
    };
}

/**
 * Get single email with full content
 */
export async function getEmail(userId, messageId) {
    const gmail = await getGmailClient(userId);

    const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
    });

    return parseEmailFull(res.data);
}

/**
 * Send email via Gmail
 */
export async function sendEmail(userId, { to, subject, body, cc, bcc }) {
    const gmail = await getGmailClient(userId);

    // Build email
    const email = [
        `To: ${to}`,
        cc ? `Cc: ${cc}` : '',
        bcc ? `Bcc: ${bcc}` : '',
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body
    ].filter(Boolean).join('\r\n');

    // Encode to base64
    const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage
        }
    });

    return res.data;
}

/**
 * Search emails by contact email
 */
export async function searchEmailsByContact(userId, contactEmail, limit = 10) {
    return listEmails(userId, {
        maxResults: limit,
        query: `from:${contactEmail} OR to:${contactEmail}`
    });
}

/**
 * Disconnect Gmail integration
 */
export async function disconnectGmail(userId) {
    await query(
        `DELETE FROM email_integrations WHERE user_id = $1 AND provider = 'gmail'`,
        [userId]
    );
}

/**
 * Check if user has Gmail connected
 */
export async function isGmailConnected(userId) {
    const result = await query(
        `SELECT id FROM email_integrations WHERE user_id = $1 AND provider = 'gmail'`,
        [userId]
    );
    return result.rows.length > 0;
}

// Helper: Parse email metadata
function parseEmailMetadata(message) {
    const headers = message.payload?.headers || [];
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    return {
        id: message.id,
        threadId: message.threadId,
        snippet: message.snippet,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        labelIds: message.labelIds,
        isUnread: message.labelIds?.includes('UNREAD')
    };
}

// Helper: Parse full email
function parseEmailFull(message) {
    const metadata = parseEmailMetadata(message);
    let body = '';

    // Extract body from payload
    const extractBody = (part) => {
        if (part.mimeType === 'text/html' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
        if (part.parts) {
            for (const subPart of part.parts) {
                const result = extractBody(subPart);
                if (result) return result;
            }
        }
        if (part.mimeType === 'text/plain' && part.body?.data) {
            return `<pre>${Buffer.from(part.body.data, 'base64').toString('utf-8')}</pre>`;
        }
        return null;
    };

    if (message.payload) {
        body = extractBody(message.payload) || '';
    }

    return {
        ...metadata,
        body
    };
}

export default {
    getAuthUrl,
    exchangeCodeForTokens,
    saveUserTokens,
    getUserTokens,
    getGmailClient,
    getProfile,
    listEmails,
    getEmail,
    sendEmail,
    searchEmailsByContact,
    disconnectGmail,
    isGmailConnected
};
