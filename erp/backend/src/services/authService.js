// backend/src/services/authService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { generateOtp, getExpiry } from '../utils/otp.js';
import { JWT_SECRET } from '../config/env.js';
import { sendOtpEmail } from '../utils/mailer.js';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const requestRegisterOtp = async (rawEmail) => {
    const email = normalizeEmail(rawEmail);

    const code = generateOtp();
    const expiresAt = getExpiry(10);

    await query(
        `INSERT INTO otps (email, code, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
        [email, code, 'REGISTER', expiresAt]
    );

    const mailResult = await sendOtpEmail({
        to: email,
        otp: code,
        purpose: 'REGISTER',
    });

    if (!mailResult.success) {
        console.warn(
            'OTP email not delivered. OTP logged on server only (dev mode).'
        );
    }

    return {
        message:
            "OTP generated. If email doesn't arrive, use the OTP from server logs.",
        devOtp: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
};

export const verifyRegistration = async ({ name, rawEmail, otp, password }) => {
    const email = normalizeEmail(rawEmail);

    const {
        rows: [otpRow],
    } = await query(
        `SELECT * FROM otps
     WHERE email = $1 AND code = $2 AND purpose = $3 AND used = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
        [email, otp, 'REGISTER']
    );

    if (!otpRow) {
        const error = new Error('Invalid OTP');
        error.statusCode = 400;
        throw error;
    }

    const nowIso = new Date().toISOString();
    if (otpRow.expires_at < nowIso) {
        const error = new Error('OTP expired');
        error.statusCode = 400;
        throw error;
    }

    const hashed = bcrypt.hashSync(password, 10);

    const {
        rows: [user],
    } = await query(
        `INSERT INTO users (name, email, password, is_verified)
     VALUES ($1, $2, $3, TRUE)
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       password = EXCLUDED.password,
       is_verified = TRUE
     RETURNING id, name, email, role`,
        [name, email, hashed]
    );

    await query(`UPDATE otps SET used = TRUE WHERE id = $1`, [otpRow.id]);

    const role = user.role || 'user';

    const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
    );

    return {
        message: 'Registration successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role,
        },
    };
};

export const loginUser = async (rawEmail, password) => {
    const email = normalizeEmail(rawEmail);

    const {
        rows: [user],
    } = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
        console.warn('Login failed: user not found for', email);
        const error = new Error('Invalid credentials');
        error.statusCode = 400;
        throw error;
    }

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) {
        console.warn('Login failed: wrong password for', email);
        const error = new Error('Invalid credentials');
        error.statusCode = 400;
        throw error;
    }

    const role = user.role || 'user';

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            name: user.name,
            role,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );

    console.log('Login successful for', email);

    return {
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role,
            avatar: user.avatar || null,
        },
    };
};

export const requestPasswordReset = async (rawEmail) => {
    const email = normalizeEmail(rawEmail);

    const { rowCount } = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (rowCount === 0) {
        console.warn('Forgot password for non-existing email:', email);
        return {
            message:
                'If the email exists, an OTP has been sent to reset the password',
        };
    }

    const code = generateOtp();
    const expiresAt = getExpiry(10);

    await query(
        `INSERT INTO otps (email, code, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
        [email, code, 'RESET', expiresAt]
    );

    try {
        await sendOtpEmail({ to: email, otp: code, purpose: 'RESET' });
        console.log('Reset OTP for', email, '=>', code);
        return {
            message:
                'If the email exists, an OTP has been sent to reset the password',
        };
    } catch (mailErr) {
        console.error('Error sending reset OTP email:', mailErr);
        const error = new Error('Failed to send OTP email. Try again.');
        error.statusCode = 500;
        throw error;
    }
};

export const verifyPasswordReset = async ({ rawEmail, otp, newPassword }) => {
    const email = normalizeEmail(rawEmail);

    const {
        rows: [otpRow],
    } = await query(
        `SELECT * FROM otps
     WHERE email = $1 AND code = $2 AND purpose = $3 AND used = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
        [email, otp, 'RESET']
    );

    if (!otpRow) {
        const error = new Error('Invalid OTP');
        error.statusCode = 400;
        throw error;
    }

    const nowIso = new Date().toISOString();
    if (otpRow.expires_at < nowIso) {
        const error = new Error('OTP expired');
        error.statusCode = 400;
        throw error;
    }

    const hashed = bcrypt.hashSync(newPassword, 10);

    const result = await query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashed, email]
    );

    if (result.rowCount === 0) {
        console.warn('Password reset for non-existing email:', email);
        const error = new Error('User not found for this email');
        error.statusCode = 400;
        throw error;
    }

    await query('UPDATE otps SET used = TRUE WHERE id = $1', [otpRow.id]);

    console.log('Password reset successful for', email);
    return { message: 'Password reset successful' };
};

export const googleLogin = async ({ idToken, credential, googleClient, GOOGLE_CLIENT_ID }) => {
    const token = idToken || credential;

    if (!token) {
        const error = new Error('idToken (or credential) is required');
        error.statusCode = 400;
        throw error;
    }

    if (!googleClient || !GOOGLE_CLIENT_ID) {
        console.error('Google auth not configured on server.');
        const error = new Error('Google login is not configured on server.');
        error.statusCode = 500;
        throw error;
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const rawEmail = payload.email || '';
    const email = normalizeEmail(rawEmail);
    const name = payload.name || email;
    const avatar = payload.picture || null;

    if (!email) {
        const error = new Error('Google account does not have a valid email.');
        error.statusCode = 400;
        throw error;
    }

    const { rows } = await query(
        'SELECT * FROM users WHERE email = $1 OR google_id = $2',
        [email, googleId]
    );

    let user = rows[0];

    if (!user) {
        const dummyPassword = bcrypt.hashSync(googleId + JWT_SECRET, 10);

        const insertRes = await query(
            `INSERT INTO users (name, email, password, role, is_verified, google_id, avatar)
       VALUES ($1, $2, $3, $4, TRUE, $5, $6)
       RETURNING id, name, email, role, avatar, google_id`,
            [name, email, dummyPassword, 'user', googleId, avatar]
        );

        user = insertRes.rows[0];
        console.log('Google login created new user:', email);
    } else {
        const newGoogleId = user.google_id || googleId;
        const newAvatar = avatar || user.avatar || null;

        await query(
            `UPDATE users
         SET google_id = $1,
             avatar = $2
       WHERE id = $3`,
            [newGoogleId, newAvatar, user.id]
        );

        user.google_id = newGoogleId;
        user.avatar = newAvatar;
        console.log('Google login successful for existing user:', email);
    }

    const role = user.role || 'user';

    const jwtPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role,
    };

    const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, {
        expiresIn: '30d',
    });

    return {
        message: 'Login successful',
        token: jwtToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role,
            avatar: user.avatar || avatar || null,
            google_id: user.google_id || googleId,
        },
    };
};
