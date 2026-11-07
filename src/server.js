const os = require('os');
const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB, closeDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const reEngagementWorker = require('./modules/notification/reEngagement.worker');

let server;

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    const localIp = getLocalIP();

    // 2. Create HTTP server & attach Socket.IO
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    // 3. Start Express HTTP & WebSocket server binding to all network interfaces
    server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      console.log(`\n=================================================`);
      console.log(`🚀 Basha Lagbe Backend API running on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🏠 Local:   http://localhost:${env.PORT}`);
      console.log(`🌐 Network: http://${localIp}:${env.PORT}`);
      console.log(`🩺 Health:          http://${localIp}:${env.PORT}/health`);
      console.log(`🔐 Auth API:        http://${localIp}:${env.PORT}/api/auth`);
      console.log(`👤 Users API:       http://${localIp}:${env.PORT}/api/users`);
      console.log(`🏠 Property API:    http://${localIp}:${env.PORT}/api/properties`);
      console.log(`🛏️  Mess API:        http://${localIp}:${env.PORT}/api/messes`);
      console.log(`👨‍👩‍👧 Family Expense:  http://${localIp}:${env.PORT}/api/family-expenses`);
      console.log(`🔔 Alerts API:      http://${localIp}:${env.PORT}/api/alerts`);
      console.log(`📨 Notifications:   http://${localIp}:${env.PORT}/api/notifications`);
      console.log(`⚡ WebSocket / WS:   ws://${localIp}:${env.PORT} (Socket.IO)`);
      console.log(`=================================================\n`);

      // 4. Start Smart Background Re-engagement Worker
      reEngagementWorker.start();
    });
  } catch (error) {
    console.error(`[Server Startup Failure] ${error.message}`);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Initiating graceful shutdown...`);

  reEngagementWorker.stop();

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed successfully.');
      try {
        await closeDB();
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }

  // Force shutdown after 10 seconds if hanging
  setTimeout(() => {
    console.error('Forcefully terminating process due to shutdown timeout.');
    process.exit(1);
  }, 10000);
};

// Process termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Uncaught exceptions & unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at Promise]:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
  gracefulShutdown('uncaughtException');
});

startServer();
