// Teams Backend - Lightweight Auth Middleware
// This middleware trusts the API Gateway has already validated the user
// It just ensures user info exists in the request (set by app.js from headers)

/**
 * Gateway-trusted authentication middleware
 * Gateway has already validated JWT and added user info to headers
 * This just checks that user info was properly extracted
 */
export async function authMiddleware(req, res, next) {
    // User should already be set by app.js middleware from gateway headers
    if (!req.user || !req.user.userId) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required - No user context from gateway'
        });
    }
    next();
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

    // If user has a company, proceed
    if (req.user.companyId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        error: 'You must be part of a company to access this resource'
    });
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
