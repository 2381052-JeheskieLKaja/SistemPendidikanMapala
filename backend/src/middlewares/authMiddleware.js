const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { unauthorized } = require('../utils/response');

/** Verifikasi header Authorization: Bearer <token>; isi req.user = { id_user, role }. */
function authMiddleware(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized('Token tidak ditemukan, silakan login'));
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id_user: payload.id_user, role: payload.role };
    return next();
  } catch {
    return next(unauthorized('Sesi tidak valid atau kedaluwarsa, silakan login kembali'));
  }
}

module.exports = authMiddleware;
