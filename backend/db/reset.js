// Menjalankan db/schema.sql lalu db/seed.sql ke database PostgreSQL dari .env (atau DB_TEST_NAME bila NODE_ENV=test).
// Setara dengan: psql -h <host> -p <port> -U <user> -d <db> -f db/schema.sql -f db/seed.sql
const fs = require('fs');
const path = require('path');
const env = require('../src/config/env');
const { isMockMode, resetMockDb } = require('../src/config/db');

async function reset({ seed = true } = {}) {
  if (process.env.SKIP_DB_RESET === 'true') {
    console.log('SKIP_DB_RESET=true — melewati reset database.');
    return;
  }

  if (isMockMode()) {
    resetMockDb();
    return;
  }

  const { Client } = require('pg');
  const clientConfig = env.db.connectionString
    ? { connectionString: env.db.connectionString }
    : {
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
      };
  const client = new Client({
    ...clientConfig,
    ...(env.db.ssl ? { ssl: env.db.ssl } : {}),
  });

  await client.connect();
  try {
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    if (seed) {
      await client.query(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
    }
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  reset({ seed: !process.argv.includes('--no-seed') })
    .then(() => {
      if (process.env.SKIP_DB_RESET === 'true') return;
      const target = env.db.database || (env.db.connectionString ? 'DATABASE_URL' : '(mock)');
      console.log(`Database PostgreSQL ${target} berhasil di-reset.`);
    })
    .catch((err) => {
      console.error('Gagal reset database:', err.message);
      process.exit(1);
    });
}

module.exports = { reset };
