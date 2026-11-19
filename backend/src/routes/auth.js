const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const c = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.loginRateMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
});

// Tidak ada endpoint logout: logout dilakukan di frontend dengan menghapus token (K8).
router.post('/login', loginLimiter, c.login);

module.exports = router;
