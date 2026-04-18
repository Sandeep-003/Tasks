import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { initSocket } from './socket/socket.handler.js';
import { logger } from './utils/logger.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// HTTP + Socket.IO server
const httpServer = createServer(app);
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});
initSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});
