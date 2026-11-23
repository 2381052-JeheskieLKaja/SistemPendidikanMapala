const multer = require('multer');
const { HttpError } = require('../utils/response');
const { MAX_SIZE_MB } = require('./upload');

const fail = (res, status, message, errors) =>
  res.status(status).json({ success: false, message, ...(errors && { errors }) });

function notFoundHandler(req, res) {
  return fail(res, 404, 'Endpoint tidak ditemukan');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) return fail(res, err.status, err.message, err.errors);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return fail(res, 413, `Ukuran file maksimal ${MAX_SIZE_MB} MB`);
    return fail(res, 400, 'Unggahan file tidak valid');
  }
  if (err.type === 'entity.parse.failed') return fail(res, 400, 'Format data tidak valid');
  if (err.type === 'entity.too.large') return fail(res, 413, 'Data terlalu besar');
  if (err.code === '23505') return fail(res, 409, 'Data sudah terdaftar');
  if (err.code === '23503') {
    if (String(err.detail || '').includes('is still referenced')) {
      return fail(res, 409, 'Data tidak dapat dihapus karena masih digunakan oleh data lain');
    }
    return fail(res, 400, 'Data referensi tidak ditemukan');
  }

  // Detail teknis hanya dicatat di log server, tidak dikirim ke klien.
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  return fail(res, 500, 'Terjadi kesalahan, coba lagi');
}

module.exports = { errorHandler, notFoundHandler };
