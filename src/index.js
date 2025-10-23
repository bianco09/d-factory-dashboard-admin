const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const {
  sanitizeInputs,
  logSuspiciousActivity,
} = require("./middleware/sanitization");
require("dotenv").config();

const app = express();

// Global error handlers for serverless
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Initialize Prisma with error handling
let prisma;
try {
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "pretty",
  });
} catch (error) {
  console.error("Failed to initialize Prisma:", error);
  process.exit(1);
}

// Check required environment variables
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  process.exit(1);
}

console.log("✅ Environment variables loaded successfully");
console.log("🌍 Environment:", process.env.NODE_ENV);
console.log("🗄️ Database URL exists:", !!process.env.DATABASE_URL);
console.log("🔑 JWT Secret exists:", !!process.env.JWT_SECRET);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      // Additional security: prevent JSON bombs
      if (buf.length > 10 * 1024 * 1024) {
        throw new Error("Request entity too large");
      }
    },
  })
);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Needed for Vercel
  })
);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 booking attempts per minute
  message: {
    error: "Too many booking attempts, please wait before trying again.",
  },
});

app.use("/api/", generalLimiter);

// Input sanitization and security monitoring
app.use(sanitizeInputs);
app.use(logSuspiciousActivity);
// Determine allowed origins based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://thecurioexpeditions.vercel.app",
        "https://thecurioexpeditions.com",
        "https://d-factory-dashboard-admin.vercel.app",
        "https://d-factory-fe-dashboard-admin.vercel.app",
      ]
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
      ];

console.log("🌍 Environment:", process.env.NODE_ENV);
console.log("🔗 Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: !!process.env.DATABASE_URL,
    jwt: !!process.env.JWT_SECRET,
  });
});

// Basic API test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

// Protected routes
const toursRouter = require("./routes/tours");
const bookingsRouter = require("./routes/bookings");
const usersRouter = require("./routes/users");

app.use("/api/tours", toursRouter);
app.use("/api/bookings", bookingLimiter, bookingsRouter);
app.use("/api/users", usersRouter);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 4000;

// Export for Vercel serverless and also start server for local development
if (require.main === module) {
  // Only start server if this file is run directly (not imported)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
