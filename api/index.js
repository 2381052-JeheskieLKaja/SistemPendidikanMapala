const app = require('../backend/src/app');
const { initDb } = require('../backend/src/config/db');

let dbInitPromise;

module.exports = async (req, res) => {
  if (!dbInitPromise) {
    dbInitPromise = initDb().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  await dbInitPromise;
  return app(req, res);
};
