import bcrypt from 'bcryptjs';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  getAccessCookieOptions,
  getRefreshCookieOptions,
  getClearCookieOptions,
  getRefreshExpiryDate,
} from '../../utils/jwt.js';
import { conflict, unauthorized } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { createUser, findUserByEmail, findUserById } from '../user/user.repository.js';
import {
  createRefreshSession,
  findRefreshSession,
  deleteRefreshSession,
  deleteExpiredSessions,
} from './auth.repository.js';
import { validateRegisterInput, validateLoginInput } from './auth.validation.js';

function buildUserPayload(user) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, getAccessCookieOptions());
  res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());
}

export async function register(body, res) {
  const { name, email, password } = validateRegisterInput(body);

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw conflict('Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, passwordHash });

  const payload = buildUserPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createRefreshSession(user.id, refreshToken, getRefreshExpiryDate());
  setAuthCookies(res, accessToken, refreshToken);

  logger.info('User registered', { userId: user.id, email: user.email });
  return { user };
}

export async function login(body, res) {
  const { email, password } = validateLoginInput(body);

  const user = await findUserByEmail(email);
  if (!user) {
    throw unauthorized('Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw unauthorized('Invalid credentials');
  }

  const payload = buildUserPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createRefreshSession(user.id, refreshToken, getRefreshExpiryDate());
  setAuthCookies(res, accessToken, refreshToken);

  logger.info('User logged in', { userId: user.id });
  return { user: payload };
}

export async function refresh(refreshToken, res) {
  if (!refreshToken) {
    throw unauthorized();
  }

  await deleteExpiredSessions();

  const session = await findRefreshSession(refreshToken);
  if (!session || new Date(session.expires_at) < new Date()) {
    throw unauthorized();
  }

  const payload = verifyToken(refreshToken);
  const user = await findUserById(payload.id);
  if (!user) {
    throw unauthorized();
  }

  await deleteRefreshSession(refreshToken);

  const nextPayload = buildUserPayload(user);
  const nextAccessToken = signAccessToken(nextPayload);
  const nextRefreshToken = signRefreshToken(nextPayload);
  await createRefreshSession(user.id, nextRefreshToken, getRefreshExpiryDate());

  setAuthCookies(res, nextAccessToken, nextRefreshToken);

  logger.info('Refresh token rotated', { userId: user.id });
  return { ok: true };
}

export async function getMe(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw unauthorized();
  }
  return { user };
}

export async function logout(refreshToken, res) {
  if (refreshToken) {
    await deleteRefreshSession(refreshToken);
  }

  const clearCookieOptions = getClearCookieOptions();
  res.clearCookie('access_token', clearCookieOptions);
  res.clearCookie('refresh_token', clearCookieOptions);

  return { ok: true };
}
