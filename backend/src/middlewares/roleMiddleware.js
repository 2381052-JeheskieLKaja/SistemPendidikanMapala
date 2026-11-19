const { forbidden, unauthorized } = require('../utils/response');

/** Izinkan hanya role tertentu. Dipasang setelah authMiddleware. */
function roleMiddleware(roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('Anda tidak memiliki hak akses'));
    return next();
  };
}

module.exports = roleMiddleware;
