// backend/src/routes/auth.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import * as authController from '../controllers/auth/authController.js';

const router = express.Router();

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation error:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

router.post('/register-request-otp', authController.registerRequestOtp);

router.post(
  '/register-verify',
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail(),
    body('otp').isLength({ min: 4 }),
    body('password').isLength({ min: 6 }),
  ]),
  authController.registerVerify
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

router.post(
  '/forgot-password-request',
  validate([body('email').isEmail()]),
  authController.forgotPasswordRequest
);

router.post(
  '/forgot-password-verify',
  validate([
    body('email').isEmail(),
    body('otp').isLength({ min: 4 }),
    body('newPassword').isLength({ min: 6 }),
  ]),
  authController.forgotPasswordVerify
);

router.post('/google', authController.google);

export default router;