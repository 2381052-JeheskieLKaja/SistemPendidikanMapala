const app = require('./app');
const env = require('./config/env');
const { initDb } = require('./config/db');

async function start() {
  await initDb();
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server berjalan di http://0.0.0.0:${env.port}`);
  });
}

start();
