const jwt = require('jsonwebtoken');
const { getUsers } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_achintyah_rbac_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    const users = getUsers();
    const currentUser = users.find(u => u.id === decoded.id);

    if (!currentUser) {
      return res.status(403).json({ message: 'User account no longer exists' });
    }

    req.user = {
      id: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      role: currentUser.role,
      permissions: currentUser.permissions || []
    };
    next();
  });
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin role has all privileges automatically
    if (req.user.role === 'admin' || req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      message: `Access denied. Requires '${permission}' permission.`
    });
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requirePermission
};
