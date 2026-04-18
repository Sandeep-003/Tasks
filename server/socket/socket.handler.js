import { verifyToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

let ioInstance = null;

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const index = entry.indexOf('=');
      if (index <= 0) return acc;
      const key = entry.slice(0, index);
      const value = decodeURIComponent(entry.slice(index + 1));
      acc[key] = value;
      return acc;
    }, {});
}

function userRoom(userId) {
  return `user:${userId}`;
}

export function initSocket(io) {
  ioInstance = io;

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || '';
      const cookies = parseCookies(cookieHeader);
      const token = cookies['access_token'];

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const payload = verifyToken(token);
      socket.user = {
        id: payload.id,
        role: payload.role,
        name: payload.name,
      };
      return next();
    } catch (err) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const room = userRoom(socket.user.id);
    socket.join(room);
    logger.info('Socket connected', { socketId: socket.id, userId: socket.user.id });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id, userId: socket.user.id });
    });
  });
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance) {
    return;
  }
  ioInstance.to(userRoom(userId)).emit(event, payload);
}
