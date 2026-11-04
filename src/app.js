const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const env = require('./config/env');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const propertyRoutes = require('./modules/property/property.routes');
const messRoutes = require('./modules/mess/mess.routes');
const familyExpenseRoutes = require('./modules/family-expense/familyExpense.routes');
const alertRoutes = require('./modules/alert/alert.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const { generalRateLimiter } = require('./middlewares/rateLimiter');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// Security HTTP headers (allowing cross-origin image loading for mobile app)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Enable CORS
const corsOptions = {
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// HTTP Response compression
app.use(compression());

// Parse incoming JSON and urlencoded requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 400) {
      console.log(`[HTTP ${res.statusCode}] ${req.method} ${req.originalUrl}:`, JSON.stringify(body));
    }
    return oldJson.call(this, body);
  };
  next();
});

// Apply general rate limiter across all incoming requests
app.use(generalRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 200,
    message: 'Basha Lagbe Backend API is healthy and operational',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 200,
    message: 'Welcome to Basha Lagbe (House Rental & Mess Management) API',
    data: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      properties: '/api/properties',
      messes: '/api/messes',
      familyExpenses: '/api/family-expenses',
      alerts: '/api/alerts',
      upload: '/api/upload',
    },
  });
});

// Serve static uploads folder (accessible from mobile app & web)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount module routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/messes', messRoutes);
app.use('/api/family-expenses', familyExpenseRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/upload', uploadRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

module.exports = app;
