require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const logger = require('./src/config/logger');
const requestLogger = require('./src/middleware/requestLogger');
const errorHandler = require('./src/middleware/errorHandler');

const sessionRoutes = require('./src/routes/sessionRoutes');
const agentRoutes = require('./src/routes/agentRoutes');

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ===== Serve Static Frontend =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== API Routes =====
app.use('/api', sessionRoutes);
app.use('/api', agentRoutes);

// ===== Health Check =====
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ===== Error Handler (Last Middleware) =====
app.use(errorHandler);

// ===== Create HTTP + Socket.IO Server =====
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ===== Start App after DB Connection =====
connectDB()
  .then(() => {
    // ✅ Socket Authentication Middleware
    io.use(async (socket, next) => {
      try {
        const { apiKey, sessionId, userId, role } = socket.handshake.auth || {};

        if (!apiKey || apiKey !== process.env.API_KEY) {
          return next(new Error('Invalid API key'));
        }

        if (!sessionId || !userId || !role) {
          return next(new Error('Missing authentication fields'));
        }

        const Session = require('./src/models/Session');
        const session = await Session.findOne({ sessionId });

        if (!session) return next(new Error('Session not found'));
        if (role === 'user' && session.userId !== userId)
          return next(new Error('User not authorized'));
        if (role === 'agent' && session.agentId !== userId)
          return next(new Error('Agent not authorized'));

        // Attach session data to socket
        socket.data = { sessionId, userId, role };
        next();
      } catch (err) {
        next(err);
      }
    });

    // ===== Socket Events =====
    io.on('connection', (socket) => {
      const room = `session:${socket.data.sessionId}`;
      socket.join(room);

      logger.info(`${socket.data.role} (${socket.data.userId}) joined ${room}`);
      socket.to(room).emit('system', { message: `${socket.data.role} joined` });

      // ✅ Handle incoming messages
      socket.on('message', async (payload) => {
        try {
          const Message = require('./src/models/Message');
          const msg = await Message.create({
            sessionId: socket.data.sessionId,
            sender: socket.data.userId,
            role: socket.data.role,
            message: payload.message,
            timestamp: new Date(),
          });

          io.to(room).emit('message', msg);
          logger.info(`Message saved in ${room}: ${payload.message}`);
        } catch (err) {
          logger.error('Socket message error:', err.message || err);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // ✅ Handle disconnects
      socket.on('disconnect', () => {
        logger.info(
          `Socket disconnected: ${socket.id} (${socket.data?.userId})`
        );
        socket.to(room).emit('system', {
          message: `${socket.data.role} left the chat`,
        });
      });
    });

    // ===== Start Server =====
    const PORT = process.env.PORT || 5002;
    const HOST = process.env.HOST || '127.0.0.1';

    server.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('❌ Failed to start server: ' + err.message);
    process.exit(1);
  });

