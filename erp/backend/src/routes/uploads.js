// src/routes/uploads.js - File Upload Routes
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { uploadAvatar, uploadLogo, uploadDocument, uploadMultipleDocuments, uploadMiddleware, getFileUrl } from '../utils/fileUpload.js';
import { query } from '../db/pool.js';

const router = express.Router();

// Upload avatar
router.post('/avatar', authMiddleware, uploadMiddleware('avatars'), (req, res) => {
    uploadAvatar(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        try {
            const avatarUrl = getFileUrl(req.file.filename, 'avatars');

            // Update user avatar in database
            await query(
                'UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2',
                [avatarUrl, req.user.userId]
            );

            res.json({
                success: true,
                data: {
                    url: avatarUrl,
                    filename: req.file.filename,
                    size: req.file.size
                }
            });
        } catch (error) {
            console.error('Avatar upload error:', error);
            res.status(500).json({ success: false, error: 'Failed to save avatar' });
        }
    });
});

// Upload company logo
router.post('/logo', authMiddleware, uploadMiddleware('logos'), (req, res) => {
    uploadLogo(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        try {
            const logoUrl = getFileUrl(req.file.filename, 'logos');
            const { companyId } = req.user;

            if (companyId) {
                await query(
                    'UPDATE companies SET logo = $1, updated_at = NOW() WHERE id = $2',
                    [logoUrl, companyId]
                );
            }

            res.json({
                success: true,
                data: {
                    url: logoUrl,
                    filename: req.file.filename,
                    size: req.file.size
                }
            });
        } catch (error) {
            console.error('Logo upload error:', error);
            res.status(500).json({ success: false, error: 'Failed to save logo' });
        }
    });
});

// Upload single document
router.post('/document', authMiddleware, uploadMiddleware('documents'), (req, res) => {
    uploadDocument(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        try {
            const docUrl = getFileUrl(req.file.filename, 'documents');
            const { entityType, entityId, description } = req.body;
            const { companyId, userId } = req.user;

            // Optionally save to a documents table
            const result = await query(
                `INSERT INTO documents (company_id, uploaded_by, entity_type, entity_id, filename, original_name, file_path, file_size, mime_type, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
                [companyId, userId, entityType || null, entityId || null, req.file.filename, req.file.originalname, docUrl, req.file.size, req.file.mimetype, description || null]
            );

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            // If documents table doesn't exist, just return the URL
            console.warn('Documents table may not exist:', error.message);
            res.json({
                success: true,
                data: {
                    url: getFileUrl(req.file.filename, 'documents'),
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimeType: req.file.mimetype
                }
            });
        }
    });
});

// Upload multiple documents
router.post('/documents', authMiddleware, uploadMiddleware('documents'), (req, res) => {
    uploadMultipleDocuments(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const files = req.files.map(file => ({
            url: getFileUrl(file.filename, 'documents'),
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype
        }));

        res.json({
            success: true,
            data: files,
            count: files.length
        });
    });
});

// Get uploaded documents for entity
router.get('/documents/:entityType/:entityId', authMiddleware, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { companyId } = req.user;

        const result = await query(
            `SELECT * FROM documents 
       WHERE company_id = $1 AND entity_type = $2 AND entity_id = $3
       ORDER BY created_at DESC`,
            [companyId, entityType, entityId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get documents error:', error);
        res.json({ success: true, data: [] });
    }
});

export default router;
