// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import pool from '../config/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Authentication middleware - verifies JWT token
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from database
    const result = await pool.query(
      `SELECT id, name, email, role, company_id, is_active 
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    if (user.is_active === false) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      companyId: user.company_id,
    };

    next();
  } catch (err) {
    console.error('JWT error:', err);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - Roles that can access the route
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role;

    // Platform admin can access everything
    if (userRole === 'platform_admin') {
      return next();
    }

    // Company admin can access all company routes
    if (userRole === 'company_admin' && !allowedRoles.includes('platform_admin')) {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
}

/**
 * Company membership middleware - ensures user belongs to a company
 */
export function requireCompany(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Platform admin doesn't need to be in a company
  if (req.user.role === 'platform_admin') {
    return next();
  }

  // Customer role is for marketplace users - they don't need a company
  if (req.user.role === 'customer') {
    return next();
  }

  // If user has a company, proceed
  if (req.user.companyId) {
    return next();
  }

  // company_admin without a company needs to register one first
  if (req.user.role === 'company_admin') {
    return res.status(403).json({
      success: false,
      error: 'Please register your company first to access this module',
      needsCompany: true
    });
  }

  // Other roles without company
  return res.status(403).json({
    success: false,
    error: 'You must be part of a company to access this resource'
  });
}

/**
 * Admin only middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'platform_admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
}

/**
 * Error handler middleware
 */
export function errorHandler(err, _req, res, _next) {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
}

// Default export for backwards compatibility
export default authMiddleware;
