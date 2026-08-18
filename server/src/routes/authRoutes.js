const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// Public Routes with dedicated strict rate limiting
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/logout", logout);

// Protected Routes (Authentication required)
router.get("/me", authMiddleware, getMe);

module.exports = router;