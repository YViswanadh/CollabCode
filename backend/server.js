
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const compilerRoutes = require('./routes/compilerRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { socketAuthMiddleware } = require('./middleware/authMiddleware');

connectDB();

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ─── REST Routes ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'CollabCode API is running.' });
});
app.use('/api/auth', authRoutes);
app.use('/api/compile', compilerRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// ─── Socket.IO Setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// JWT gate: every Socket.IO connection must present a valid token
io.use(socketAuthMiddleware);

const socketToRoomMap = new Map();
const userInfoMap = new Map();
const roomExecutionLocks = new Map(); // roomId -> { socketId, displayName }

io.on('connection', (socket) => {
  // socket.user is set by socketAuthMiddleware: { userId, displayName, email }
  const { userId, displayName } = socket.user;
  userInfoMap.set(socket.id, { userId, nickname: displayName });
  console.log(`[Socket.IO] User connected: ${displayName} (${socket.id})`);

  socket.on('joinRoom', (roomId, callback) => {
    const currentUserInfo = userInfoMap.get(socket.id);
    const previousRoom = socketToRoomMap.get(socket.id);

    if (previousRoom && previousRoom !== roomId) {
      socket.leave(previousRoom);
      io.to(previousRoom).emit('userLeftAppRoom', {
        userId: currentUserInfo.userId,
        nickname: currentUserInfo.nickname,
        roomId: previousRoom,
        message: `${currentUserInfo.nickname} left the room.`,
      });
      console.log(`[Socket.IO] ${currentUserInfo.nickname} left room: ${previousRoom}`);
    }

    socket.join(roomId);
    socketToRoomMap.set(socket.id, roomId);
    console.log(`[Socket.IO] ${currentUserInfo.nickname} joined room: ${roomId}`);

    socket.to(roomId).emit('userJoinedAppRoom', {
      userId: currentUserInfo.userId,
      nickname: currentUserInfo.nickname,
      roomId,
      message: `${currentUserInfo.nickname} joined the room.`,
    });

    if (typeof callback === 'function') {
      callback({ status: 'ok', roomId });
    }
  });

  socket.on('cursorChange', (cursorData) => {
    const currentRoom = socketToRoomMap.get(socket.id);
    if (currentRoom) {
      const info = userInfoMap.get(socket.id) || {};
      socket.to(currentRoom).emit('cursorUpdate', {
        userId: info.userId,
        nickname: info.nickname,
        ...cursorData,
      });
    }
  });

  // Real-Time Room Text Chat Broadcast Handler
  socket.on('sendMessage', (messageText) => {
    const currentRoom = socketToRoomMap.get(socket.id);
    if (currentRoom) {
      const info = userInfoMap.get(socket.id) || {};
      const timestamp = new Date().toISOString();
      io.to(currentRoom).emit('receiveMessage', {
        senderId: socket.id,
        userId: info.userId,
        nickname: info.nickname,
        text: messageText,
        timestamp,
      });
    }
  });

  // ── Synchronized Execution Sockets ──────────────────────────────────────────
  socket.on('triggerCodeExecution', (roomId, callback) => {
    if (!roomId) return;
    const existingLock = roomExecutionLocks.get(roomId);

    if (existingLock) {
      if (typeof callback === 'function') {
        callback({ status: 'error', message: `Execution locked: ${existingLock.displayName} is running code.` });
      }
      return;
    }

    // Acquire lock
    roomExecutionLocks.set(roomId, { socketId: socket.id, displayName: displayName });
    console.log(`[Socket.IO] Code execution locked for room "${roomId}" by "${displayName}"`);

    // Broadcast room locked to everyone in the room
    io.to(roomId).emit('codeExecutionStarted', {
      executingUser: displayName,
      socketId: socket.id,
    });

    if (typeof callback === 'function') {
      callback({ status: 'ok' });
    }
  });

  socket.on('codeExecutionFinished', ({ roomId, output }) => {
    if (!roomId) return;
    const activeLock = roomExecutionLocks.get(roomId);

    // Only release lock if it belongs to this sender
    if (activeLock && activeLock.socketId === socket.id) {
      roomExecutionLocks.delete(roomId);
      console.log(`[Socket.IO] Code execution completed and unlocked in room "${roomId}"`);

      // Broadcast finished output to everyone in the room
      io.to(roomId).emit('codeExecutionCompleted', { output });
    }
  });

  socket.on('disconnect', () => {
    const disconnectedRoom = socketToRoomMap.get(socket.id);
    const info = userInfoMap.get(socket.id) || { nickname: 'Unknown' };

    if (disconnectedRoom) {
      // Auto-release execution lock if the disconnected user holds it
      const activeLock = roomExecutionLocks.get(disconnectedRoom);
      if (activeLock && activeLock.socketId === socket.id) {
        roomExecutionLocks.delete(disconnectedRoom);
        console.log(`[Socket.IO] Released stale execution lock for room "${disconnectedRoom}" (User disconnected)`);
        io.to(disconnectedRoom).emit('codeExecutionCompleted', {
          output: {
            run: {
              stdout: '',
              stderr: `Code execution halted: ${info.nickname} disconnected from the room.`,
              code: 1,
              signal: 'SIGKILL'
            }
          }
        });
      }

      io.to(disconnectedRoom).emit('userLeftAppRoom', {
        userId: info.userId,
        nickname: info.nickname,
        roomId: disconnectedRoom,
        message: `${info.nickname} left the room.`,
      });
      console.log(`[Socket.IO] ${info.nickname} disconnected from room: ${disconnectedRoom}`);
      socketToRoomMap.delete(socket.id);
    } else {
      console.log(`[Socket.IO] ${info.nickname} disconnected (no room).`);
    }
    userInfoMap.delete(socket.id);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[Server] Main app server running on http://localhost:${PORT}`);
  console.log(`[Server] Yjs WebSocket server should be running on ws://localhost:1234`);
});