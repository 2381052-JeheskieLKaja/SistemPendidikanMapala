const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variabel lingkungan ${name} wajib diisi (lihat backend/.env.example)`);
  return value;
}

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  isTest,
  port: Number(process.env.PORT || 4100),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  loginRateMax: Number(process.env.LOGIN_RATE_MAX || 10),
  uploadDir: path.resolve(__dirname, isTest ? '../../uploads-test' : '../../uploads'),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: isTest ? required('DB_TEST_NAME') : required('DB_NAME'),
  },
};
