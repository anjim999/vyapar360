// backend/src/controllers/auth/authController.js
import * as authService from '../../services/authService.js';
import { GOOGLE_CLIENT_ID } from '../../config/env.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export const registerRequestOtp = async (req, res) => {
    try {
        const rawEmail = req.body.email || '';
        const result = await authService.requestRegisterOtp(rawEmail);
        return res.json(result);
    } catch (err) {
        console.error('Error in /register-request-otp:', err.message || err);
        return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
};

export const registerVerify = async (req, res) => {
    try {
        const { name, email: rawEmail, otp, password } = req.body;
        const result = await authService.verifyRegistration({ name, rawEmail, otp, password });
        return res.json(result);
    } catch (err) {
        console.error('Error in /register-verify:', err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message || 'DB error / registration failed' });
    }
};

export const login = async (req, res) => {
    try {
        const rawEmail = req.body.email || '';
        const { password } = req.body;
        const result = await authService.loginUser(rawEmail, password);
        res.json(result);
    } catch (err) {
        console.error('DB error on login:', err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message || err });
    }
};

export const forgotPasswordRequest = async (req, res) => {
    try {
        const rawEmail = req.body.email || '';
        const result = await authService.requestPasswordReset(rawEmail);
        return res.json(result);
    } catch (err) {
        console.error('DB error on forgot-password-request:', err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message || 'DB error' });
    }
};

export const forgotPasswordVerify = async (req, res) => {
    try {
        const { email: rawEmail, otp, newPassword } = req.body;
        const result = await authService.verifyPasswordReset({ rawEmail, otp, newPassword });
        return res.json(result);
    } catch (err) {
        console.error('DB error on reset verify:', err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message || 'DB error' });
    }
};

export const google = async (req, res) => {
    try {
        const { idToken, credential } = req.body || {};
        const result = await authService.googleLogin({
            idToken,
            credential,
            googleClient,
            GOOGLE_CLIENT_ID
        });
        return res.json(result);
    } catch (err) {
        console.error('Error in /api/auth/google:', err);
        const statusCode = err.statusCode || 401;
        return res.status(statusCode).json({ message: err.message || 'Invalid Google token' });
    }
};
