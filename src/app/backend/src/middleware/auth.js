const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { query } = require('../database/db');

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const result = await query('select id, email, role from users where id = $1', [decoded.userId]);
    if (!result.rowCount) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

function requireRole(roles) {
  const allowed = new Set(roles.map((r) => String(r).toUpperCase()));
  return (req, res, next) => {
    const role = req.user?.role != null ? String(req.user.role).toUpperCase() : '';
    if (!req.user || !allowed.has(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
