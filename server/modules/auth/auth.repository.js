import crypto from 'crypto';
import { query } from '../../config/db.js';

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function createRefreshSession(userId, token, expiresAt) {
  const tokenHash = sha256(token);
  const { rows } = await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1,$2,$3)
     RETURNING id, user_id, expires_at, created_at`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

export async function findRefreshSession(token) {
  const tokenHash = sha256(token);
  const { rows } = await query(
    `SELECT id, user_id, token_hash, expires_at, created_at
     FROM sessions
     WHERE token_hash = $1`,
    [tokenHash]
  );
  return rows[0] || null;
}

export async function deleteRefreshSession(token) {
  const tokenHash = sha256(token);
  await query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
}

export async function deleteExpiredSessions() {
  await query(`DELETE FROM sessions WHERE expires_at < now()`);
}
