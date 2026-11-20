const mysql = require('mysql2/promise');
const env = require('./env');
const { mockPool } = require('./mockDb');

let useMock = !env.db.user || !env.db.database;
let realPool = null;

if (!useMock) {
  try {
    realPool = mysql.createPool({
      ...env.db,
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
    });
  } catch (err) {
    console.warn('[AI Studio] Failed to initialize MySQL pool — using in-memory mock:', err.message);
    useMock = true;
  }
}

async function initDb() {
  if (useMock || !realPool) {
    useMock = true;
    console.log('[AI Studio] Database not configured — using seeded in-memory mock database');
    return;
  }
  try {
    await realPool.query('SELECT 1');
    console.log(`Database terhubung (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (err) {
    console.warn('[AI Studio] MySQL unreachable — falling back to seeded in-memory mock database:', err.message);
    useMock = true;
  }
}

const pool = {
  query: (...args) => (useMock ? mockPool.query(...args) : realPool.query(...args)),
  getConnection: (...args) => (useMock ? mockPool.getConnection(...args) : realPool.getConnection(...args)),
};

/** Jalankan fn(conn) dalam satu transaksi; rollback otomatis bila fn melempar error. */
async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, withTransaction, initDb };
