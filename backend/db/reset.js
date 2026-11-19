// Menjalankan db/schema.sql lalu db/seed.sql ke database dari .env (atau DB_TEST_NAME bila NODE_ENV=test).
// Setara dengan: mysql -u <user> -p <db> < db/schema.sql && mysql -u <user> -p <db> < db/seed.sql
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

async function reset({ seed = true } = {}) {
  const conn = await mysql.createConnection({ ...env.db, multipleStatements: true });
  try {
    await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    if (seed) await conn.query(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  reset({ seed: !process.argv.includes('--no-seed') })
    .then(() => console.log(`Database ${env.db.database} berhasil di-reset.`))
    .catch((err) => {
      console.error('Gagal reset database:', err.message);
      process.exit(1);
    });
}

module.exports = { reset };
