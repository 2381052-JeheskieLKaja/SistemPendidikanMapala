const os = require('os');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const isTest = process.env.NODE_ENV === 'test';
const connectionString = isTest
  ? (process.env.DB_TEST_URL || '')
  : (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || '');

function resolveDbSsl(connStr) {
  if (process.env.DB_SSL === 'false' || /sslmode=disable/i.test(connStr)) return false;
  if (
    process.env.DB_SSL === 'true' ||
    /sslmode=(require|verify-ca|verify-full)/i.test(connStr) ||
    /\.neon\.tech/i.test(connStr) ||
    Boolean(process.env.VERCEL && connStr)
  ) {
    return { rejectUnauthorized: false };
  }
  return false;
}

const defaultUploadDir = isTest
  ? path.resolve(__dirname, '../../uploads-test')
  : process.env.VERCEL
    ? path.join(os.tmpdir(), 'mapala-uploads')
    : path.resolve(__dirname, '../../uploads');

module.exports = {
  isTest,
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'mapala-dev-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  loginRateMax: Number(process.env.LOGIN_RATE_MAX || 10),
  uploadDir: process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : defaultUploadDir,
  db: {
    connectionString,
    host: process.env.DB_HOST || process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    user: process.env.DB_USER || process.env.PGUSER || '',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
    database: (isTest ? process.env.DB_TEST_NAME : (process.env.DB_NAME || process.env.PGDATABASE)) || '',
    ssl: resolveDbSsl(connectionString),
  },
};
