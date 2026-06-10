require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const apiRouter = require('./routes/api');

const app = express();
const server = http.createServer(app);
const socketConsultationMap = new Map();

const getConsultationRoomSize = (io, consultationId) => {
  const room = io.sockets.adapter.rooms.get(consultationId);

  return room ? room.size : 0;
};

const getConsultationId = (socket, payload) => String(payload?.consultationId || socket.data.consultationId || '').trim();

const clearSocketConsultation = (socket) => {
  const consultationId = socket.data.consultationId;

  if (consultationId && socketConsultationMap.get(consultationId) === socket.id) {
    socketConsultationMap.delete(consultationId);
  }

  socket.data.consultationId = null;
};

const io = new Server(server, {
  cors: {
    origin: [
      'https://swasthya-connect-pearl.vercel.app',
      process.env.CLIENT_URL || 'http://localhost:5173',
    ],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-consultation', (payload = {}) => {
    const consultationId = String(payload?.consultationId || '').trim();

    if (!consultationId) {
      socket.emit('consultation-error', { message: 'consultationId is required.' });
      return;
    }

    if (socket.data.consultationId && socket.data.consultationId !== consultationId) {
      socket.leave(socket.data.consultationId);
    }

    socket.join(consultationId);
    socket.data.consultationId = consultationId;
    socketConsultationMap.set(consultationId, socket.id);

    const participantCount = getConsultationRoomSize(io, consultationId);

    socket.emit('consultation-joined', {
      consultationId,
      participantCount,
      socketId: socket.id,
    });

    socket.to(consultationId).emit('consultation-peer-joined', {
      consultationId,
      participantCount,
      socketId: socket.id,
    });
  });

  socket.on('video-offer', (payload = {}) => {
    const consultationId = getConsultationId(socket, payload);

    if (!consultationId) {
      return;
    }

    socket.to(consultationId).emit('video-offer', {
      ...payload,
      consultationId,
      senderSocketId: socket.id,
    });
  });

  socket.on('video-answer', (payload = {}) => {
    const consultationId = getConsultationId(socket, payload);

    if (!consultationId) {
      return;
    }

    socket.to(consultationId).emit('video-answer', {
      ...payload,
      consultationId,
      senderSocketId: socket.id,
    });
  });

  socket.on('ice-candidate', (payload = {}) => {
    const consultationId = getConsultationId(socket, payload);

    if (!consultationId) {
      return;
    }

    socket.to(consultationId).emit('ice-candidate', {
      ...payload,
      consultationId,
      senderSocketId: socket.id,
    });
  });

  socket.on('end-call', (payload = {}) => {
    const consultationId = getConsultationId(socket, payload);
    const roomId = consultationId || socket.data.consultationId;

    if (!roomId) {
      return;
    }

    socket.to(roomId).emit('end-call', {
      consultationId: roomId,
      senderSocketId: socket.id,
    });

    socket.leave(roomId);
    socket.data.consultationId = null;

    if (socketConsultationMap.get(roomId) === socket.id) {
      socketConsultationMap.delete(roomId);
    }
  });

  socket.on('disconnect', () => {
    const consultationId = socket.data.consultationId;

    if (consultationId) {
      socket.to(consultationId).emit('end-call', {
        consultationId,
        senderSocketId: socket.id,
        reason: 'disconnect',
      });
    }

    clearSocketConsultation(socket);
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(
  cors({
    origin: [
      'https://swasthya-connect-pearl.vercel.app',
      process.env.CLIENT_URL || 'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'SwasthyaConnect API' });
});

app.use('/api/v1', apiRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);

  if (err.message === 'Only PDF and image files are allowed.') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File exceeds 5MB limit.' });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error.',
  });
});

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

(async () => {
  try {
    await connectDB();
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[${NODE_ENV.toUpperCase()}] SwasthyaConnect API Server`);
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${NODE_ENV}`);
      console.log(`✓ Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`✓ MongoDB: Connected`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
})();
