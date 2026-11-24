const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./env');

let io = null;

/**
 * Initialize Socket.IO server attached to HTTP server
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication & Authorization Middleware
  io.use((socket, next) => {
    try {
      const authHeader =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (!authHeader) {
        // Allow unauthenticated guest connections
        socket.userId = null;
        socket.deviceId = socket.handshake.query?.deviceId || socket.handshake.auth?.deviceId || null;
        return next();
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.userId = decoded.id ? decoded.id.toString() : null;
      } catch (tokenErr) {
        // If token expired/invalid, treat as guest rather than dropping connection completely
        socket.userId = null;
      }

      socket.deviceId = socket.handshake.query?.deviceId || socket.handshake.auth?.deviceId || null;
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    // Join user-specific room for targeted notifications
    if (socket.userId) {
      const userRoom = `user_${socket.userId}`;
      socket.join(userRoom);
      console.log(`[Socket.IO] Authenticated client connected: ${socket.id} (User: ${socket.userId}) joined room ${userRoom}`);
    } else if (socket.deviceId) {
      const deviceRoom = `device_${socket.deviceId}`;
      socket.join(deviceRoom);
      console.log(`[Socket.IO] Guest client connected: ${socket.id} (Device: ${socket.deviceId}) joined room ${deviceRoom}`);
    } else {
      console.log(`[Socket.IO] Anonymous client connected: ${socket.id}`);
    }

    // Client can explicitly join rooms or authenticate after initial connection
    socket.on('authenticate', (token) => {
      try {
        if (!token) return;
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(cleanToken, env.JWT_SECRET);
        if (decoded?.id) {
          socket.userId = decoded.id.toString();
          const userRoom = `user_${socket.userId}`;
          socket.join(userRoom);
          socket.emit('authenticated', { success: true, userId: socket.userId });
          console.log(`[Socket.IO] Client ${socket.id} authenticated dynamically -> Joined ${userRoom}`);
        }
      } catch (authErr) {
        socket.emit('authenticated', { success: false, message: authErr.message });
      }
    });

    // Admin Dashboard joins admin room for real-time order notifications
    socket.on('join_admin', (adminData) => {
      socket.join('admin_dashboard');
      socket.join('home_service_admins');
      console.log(`[Socket.IO] Admin joined admin_dashboard & home_service_admins room: ${socket.id}`);
    });

    // Join room for specific home service booking
    socket.on('join_booking', (bookingId) => {
      if (bookingId) {
        const room = `booking_${bookingId.toString()}`;
        socket.join(room);
        console.log(`[Socket.IO] Client ${socket.id} joined ${room}`);
      }
    });

    // Join room by client phone number
    socket.on('join_phone', (phone) => {
      if (phone) {
        const cleanPhone = phone.toString().replace(/[^0-9]/g, '');
        const room = `phone_${cleanPhone}`;
        socket.join(room);
        console.log(`[Socket.IO] Client ${socket.id} joined phone room: ${room}`);
      }
    });

    socket.on('disconnect', (reason) => {
      // Clean disconnect
    });
  });

  return io;
};

/**
 * Get active IO instance
 */
const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] Attempted to get IO instance before initialization.');
  }
  return io;
};

/**
 * Send real-time notification to a specific user
 */
const sendNotificationToUser = (userId, notification) => {
  if (!io || !userId) return;
  const userRoom = `user_${userId.toString()}`;
  io.to(userRoom).emit('notification:new', notification);
};

/**
 * Send real-time unread count update to a specific user
 */
const sendUnreadCountUpdate = (userId, unreadCount) => {
  if (!io || !userId) return;
  const userRoom = `user_${userId.toString()}`;
  io.to(userRoom).emit('notification:unread_count', { unreadCount });
};

/**
 * Send read status update to a specific user
 */
const sendNotificationReadUpdate = (userId, notificationId) => {
  if (!io || !userId) return;
  const userRoom = `user_${userId.toString()}`;
  io.to(userRoom).emit('notification:read', { id: notificationId });
};

/**
 * Real-time Home Service Socket Events
 */
const emitHomeServiceEvent = (eventName, booking) => {
  if (!io || !booking) return;
  const bookingId = (booking._id || booking.id || '').toString();
  const userId = booking.user ? (booking.user._id || booking.user).toString() : null;
  const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');

  const payload = {
    event: eventName,
    booking,
    timestamp: new Date(),
  };

  // Broadcast to admin dashboard
  io.to('admin_dashboard').emit(eventName, payload);
  io.to('home_service_admins').emit(eventName, payload);

  // Broadcast to booking room
  if (bookingId) {
    io.to(`booking_${bookingId}`).emit(eventName, payload);
  }

  // Broadcast to user room if authenticated
  if (userId) {
    io.to(`user_${userId}`).emit(eventName, payload);
  }

  // Broadcast to phone room for guest users
  if (cleanPhone) {
    io.to(`phone_${cleanPhone}`).emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendNotificationToUser,
  sendUnreadCountUpdate,
  sendNotificationReadUpdate,
  emitHomeServiceEvent,
};

