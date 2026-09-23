const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators/auth');

const router = express.Router();

// Rate limiter for auth routes — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register — create a new account
router.post('/register', authLimiter, validateRegister, register);

// POST /api/auth/login — login with email/password
router.post('/login', authLimiter, validateLogin, login);

// GET /api/auth/me — get current user (protected)
router.get('/me', auth, getMe);

module.exports = router;
