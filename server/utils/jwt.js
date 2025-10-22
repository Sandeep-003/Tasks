import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function cookieOptions(minutesFromNow) {
  const secure = process.env.NODE_ENV === 'production';
  const maxAge = minutesFromNow * 60 * 1000;
  return {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    maxAge,
  };
}
