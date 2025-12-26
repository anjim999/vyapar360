// src/utils/fileUpload.js - File Upload Utility with Multer
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/avatars', 'uploads/documents', 'uploads/logos', 'uploads/invoices'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Generate unique filename
const generateFilename = (file) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    return `${Date.now()}-${uniqueSuffix}${ext}`;
};

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.uploadType || 'documents';
        const uploadPath = path.join(__dirname, '..', '..', 'uploads', type);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, generateFilename(file));
    }
});

// File filter for different types
const createFileFilter = (allowedTypes) => {
    return (req, file, cb) => {
        const mimeTypes = {
            images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain', 'text/csv'],
            all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        };

        const allowed = mimeTypes[allowedTypes] || mimeTypes.all;

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed. Allowed: ${allowed.join(', ')}`), false);
        }
    };
};

// Different upload configurations
export const uploadAvatar = multer({
    storage,
    fileFilter: createFileFilter('images'),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('avatar');

export const uploadLogo = multer({
    storage,
    fileFilter: createFileFilter('images'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('logo');

export const uploadDocument = multer({
    storage,
    fileFilter: createFileFilter('documents'),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
}).single('document');

export const uploadMultipleDocuments = multer({
    storage,
    fileFilter: createFileFilter('all'),
    limits: { fileSize: 25 * 1024 * 1024 }
}).array('documents', 10); // Max 10 files

// Middleware wrapper with type setter
export function uploadMiddleware(type) {
    return (req, res, next) => {
        req.uploadType = type;
        next();
    };
}

// Delete file helper
export function deleteFile(filePath) {
    try {
        const fullPath = path.join(__dirname, '..', '..', filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
    return false;
}

// Get file URL helper
export function getFileUrl(filename, type = 'documents') {
    if (!filename) return null;
    return `/uploads/${type}/${filename}`;
}

export default {
    uploadAvatar,
    uploadLogo,
    uploadDocument,
    uploadMultipleDocuments,
    uploadMiddleware,
    deleteFile,
    getFileUrl
};
