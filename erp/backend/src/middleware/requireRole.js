// requireRole middleware - checks if user has required role
// company_admin and platform_admin always have access to all company features
export default function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const userRole = req.user.role;

    // Platform admin and company admin can access everything
    if (userRole === 'platform_admin' || userRole === 'company_admin') {
      return next();
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    next();
  };
}

