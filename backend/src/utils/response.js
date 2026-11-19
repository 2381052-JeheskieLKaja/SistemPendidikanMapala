/** Respons sukses seragam: { success: true, data, message }. */
function ok(res, data = null, message = 'Berhasil', status = 200) {
  return res.status(status).json({ success: true, data, message });
}

const created = (res, data, message = 'Data berhasil disimpan') => ok(res, data, message, 201);

/** Error terkontrol yang dipetakan errorHandler menjadi { success: false, message, errors }. */
class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const badRequest = (message = 'Data tidak valid', errors) => new HttpError(400, message, errors);
const unauthorized = (message = 'Silakan login terlebih dahulu') => new HttpError(401, message);
const forbidden = (message = 'Anda tidak memiliki hak akses') => new HttpError(403, message);
const notFound = (message = 'Data tidak ditemukan') => new HttpError(404, message);
const conflict = (message) => new HttpError(409, message);

module.exports = { ok, created, HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
