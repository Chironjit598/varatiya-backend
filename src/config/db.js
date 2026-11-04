const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const env = require('./env');

let mongoMemoryInstance = null;

/**
 * Connect to MongoDB
 * 1. Attempts connection to configured env.MONGO_URI
 * 2. If connection fails and environment is 'development', seamlessly launches an embedded local MongoDB instance
 *    with persistent disk storage in '.mongo-data' so user accounts and passwords are NEVER lost on restart!
 */
const connectDB = async () => {
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(env.MONGO_URI, options);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      console.warn(`[MongoDB] Local daemon not reachable at ${env.MONGO_URI}`);
      console.log(`[MongoDB] Starting Persistent Embedded MongoDB Engine...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        
        // Ensure persistent data directory exists
        const dbPath = path.resolve(process.cwd(), '.mongo-data');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }

        mongoMemoryInstance = await MongoMemoryServer.create({
          instance: {
            dbPath,
            storageEngine: 'wiredTiger',
          },
        });
        const memoryUri = mongoMemoryInstance.getUri();

        const conn = await mongoose.connect(memoryUri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        console.log(`[MongoDB] ✅ Persistent Local MongoDB active at: ${memoryUri}`);
        console.log(`[MongoDB] 💾 Data persisted to disk: ${dbPath}`);
        return conn;
      } catch (embeddedErr) {
        console.error(`[MongoDB] Failed to start embedded local database: ${embeddedErr.message}`);
        process.exit(1);
      }
    } else {
      console.error(`[MongoDB] Connection error: ${error.message}`);
      process.exit(1);
    }
  }
};

/**
 * Gracefully close database connection and embedded server if active
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close(false);
    console.log('[MongoDB] Connection closed.');
    if (mongoMemoryInstance) {
      await mongoMemoryInstance.stop();
      console.log('[MongoDB] Persistent Local MongoDB stopped.');
    }
  } catch (err) {
    console.error('[MongoDB] Error closing database:', err);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

module.exports = {
  connectDB,
  closeDB,
};
