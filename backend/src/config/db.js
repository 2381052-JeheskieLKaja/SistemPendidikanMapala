const env = require('./env');
const { mockPool, resetMockStore } = require('./mockDb');

let useMock = !env.db.connectionString && (!env.db.user || !env.db.database);
let realPool = null;

if (!useMock) {
  try {
    const { Pool, types } = require('pg');
    // Kembalikan DATE, TIME, dan TIMESTAMP sebagai string ISO konsisten (setara dateStrings pada driver sebelumnya),
    // serta parse COUNT/int8 (OID 20) menjadi integer JS.
    types.setTypeParser(20, (v) => Number(v));
    types.setTypeParser(1082, (v) => v);
    types.setTypeParser(1083, (v) => v);
    types.setTypeParser(1114, (v) => v);
    types.setTypeParser(1184, (v) => v);

    const poolConfig = env.db.connectionString
      ? { connectionString: env.db.connectionString }
      : {
          host: env.db.host,
          port: env.db.port,
          user: env.db.user,
          password: env.db.password,
          database: env.db.database,
        };

    realPool = new Pool({
      ...poolConfig,
      max: process.env.VERCEL ? 3 : 10,
      connectionTimeoutMillis: 15000,
      ...(env.db.ssl ? { ssl: env.db.ssl } : {}),
    });

    realPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL pool client:', err);
    });
  } catch (err) {
    console.warn('[AI Studio] PostgreSQL driver (pg) unavailable — using in-memory mock:', err.message);
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
    const target = env.db.connectionString ? 'DATABASE_URL' : `${env.db.host}:${env.db.port}/${env.db.database}`;
    console.log(`PostgreSQL terhubung (${target})`);
  } catch (err) {
    console.warn('[AI Studio] PostgreSQL unreachable — falling back to seeded in-memory mock database:', err.message);
    useMock = true;
  }
}

async function pgQuery(client, sql, params = []) {
  const res = await client.query(sql, params);
  return [res.rows, res];
}

const pool = {
  query: (sql, params) => (useMock ? mockPool.query(sql, params) : pgQuery(realPool, sql, params)),
  async getConnection() {
    if (useMock) return mockPool.getConnection();
    const client = await realPool.connect();
    return {
      query: (sql, params) => pgQuery(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release(),
    };
  },
  end: () => (useMock || !realPool ? Promise.resolve() : realPool.end()),
};

/** Jalankan fn(conn) dalam satu transaksi PostgreSQL; rollback otomatis bila fn melempar error. */
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

const isMockMode = () => useMock || !realPool;
const resetMockDb = () => resetMockStore();

module.exports = { pool, withTransaction, initDb, isMockMode, resetMockDb };
