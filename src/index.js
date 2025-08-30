const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { sanitizeInputs, logSuspiciousActivity } = require('./middleware/sanitization');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Additional security: prevent JSON bombs
    if (buf.length > 10 * 1024 * 1024) {
      throw new Error('Request entity too large');
    }
  }
}));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Needed for Vercel
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 booking attempts per minute
  message: { error: 'Too many booking attempts, please wait before trying again.' },
});

app.use('/api/', generalLimiter);

// Input sanitization and security monitoring
app.use(sanitizeInputs);
app.use(logSuspiciousActivity);
// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://aventur-journeys-fe.vercel.app',
      'https://d-factory-dashboard-admin.vercel.app'
    ]
  : [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3002'
    ];

console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔗 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Protected routes
const toursRouter = require('./routes/tours');
const bookingsRouter = require('./routes/bookings');
const usersRouter = require('./routes/users');

app.use('/api/tours', toursRouter);
app.use('/api/bookings', bookingLimiter, bookingsRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
