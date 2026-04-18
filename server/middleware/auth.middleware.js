import { verifyToken } from '../utils/jwt.js';
import { forbidden, unauthorized } from '../utils/errors.js';

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies['access_token'];
    if (!token) {
      throw unauthorized();
    }

    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      role: payload.role,
      name: payload.name,
      email: payload.email,
    };
    next();
  } catch (err) {
    next(unauthorized());
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(forbidden());
    }
    return next();
  };
}
