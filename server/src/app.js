const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const attendanceRoutes = require("./routes/attendanceRoutes");
const overtimeRoutes = require("./routes/overtimeRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Routes imports
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(requestLogger);

// ============================================================
// HEALTH CHECK (Placed before rate limiter to prevent probes issues)
// ============================================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Mounted Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes); 
app.use("/api/attendance", attendanceRoutes);
app.use("/api/overtime", overtimeRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;