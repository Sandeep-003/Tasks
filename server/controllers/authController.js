import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js';
import { createSession, deleteSessionByToken, findSessionByToken } from '../models/sessionModel.js';
import { signAccessToken, signRefreshToken, verifyToken, cookieOptions } from '../utils/jwt.js';

const ACCESS_MINUTES = 15; // matches 15m
const REFRESH_DAYS = 7;    // matches 7d

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, cookieOptions(ACCESS_MINUTES));
  // 7 days in minutes
  res.cookie('refresh_token', refreshToken, cookieOptions(REFRESH_DAYS * 24 * 60));
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email: email.toLowerCase(), passwordHash });
    const payload = { id: user.id, role: user.role, name: user.name, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await createSession(user.id, refreshToken, expiresAt);

    setAuthCookies(res, accessToken, refreshToken);
    return res.status(201).json({ user });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, role: user.role, name: user.name, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await createSession(user.id, refreshToken, expiresAt);
    setAuthCookies(res, accessToken, refreshToken);
    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized' });
    // Ensure token is in DB and valid
    const session = await findSessionByToken(refreshToken);
    if (!session) return res.status(401).json({ message: 'Unauthorized' });
    const payload = verifyToken(refreshToken);
    const user = await findUserById(payload.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const newAccess = signAccessToken({ id: user.id, role: user.role, name: user.name, email: user.email });
    res.cookie('access_token', newAccess, cookieOptions(ACCESS_MINUTES));
    return res.json({ ok: true });
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function me(req, res) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(req, res) {
  try {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await deleteSessionByToken(refreshToken);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
