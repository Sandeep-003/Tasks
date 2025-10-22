import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies['access_token'];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = verifyToken(token);
    req.user = { id: payload.id, role: payload.role, name: payload.name, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
