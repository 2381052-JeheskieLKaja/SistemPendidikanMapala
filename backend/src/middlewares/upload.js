const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const { badRequest } = require('../utils/response');

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png', '.mp4'];
const MAX_SIZE_MB = 20;

fs.mkdirSync(env.uploadDir, { recursive: true });

const multerUpload = multer({
  storage: multer.diskStorage({
    destination: env.uploadDir,
    // Nama file acak; nama asli tidak dipakai di disk.
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 1 },
  // Tolak dengan cb(null,false) agar body tetap terbaca dan klien menerima 400 yang rapi.
  fileFilter: (req, file, cb) => {
    const allowed = ALLOWED_EXT.includes(path.extname(file.originalname).toLowerCase());
    if (!allowed) req.fileRejected = true;
    cb(null, allowed);
  },
});

/** Middleware unggah satu file pada field "file" (opsional). */
function uploadMateri(req, res, next) {
  multerUpload.single('file')(req, res, (err) => {
    if (err) return next(err);
    if (req.fileRejected) {
      return next(badRequest('File tidak valid', { file: `Tipe file tidak diizinkan. Gunakan: ${ALLOWED_EXT.join(', ')}` }));
    }
    return next();
  });
}

/** Hapus file materi dari disk (diam bila tidak ada). */
async function removeFile(filePath) {
  if (!filePath) return;
  await fs.promises.rm(path.join(env.uploadDir, path.basename(filePath)), { force: true });
}

module.exports = { uploadMateri, removeFile, ALLOWED_EXT, MAX_SIZE_MB };
