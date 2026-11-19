const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log(`Database terhubung (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (err) {
    console.error('Gagal terhubung ke database MySQL:', err.message);
    console.error('Pastikan MySQL lokal berjalan dan konfigurasi backend/.env benar.');
    process.exit(1);
  }
  app.listen(env.port, () => console.log(`Backend berjalan di http://localhost:${env.port}`));
}

start();
