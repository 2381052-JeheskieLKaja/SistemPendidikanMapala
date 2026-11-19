// M01: terlalu banyak percobaan login → 429. Dijalankan di proses terpisah dengan batas kecil.
process.env.LOGIN_RATE_MAX = '3';
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { login, pool } = require('./helpers');

after(() => pool.end());

test('percobaan login ke-4 dalam 15 menit → 429', async () => {
  for (let i = 0; i < 3; i += 1) assert.equal((await login('admin@mapala.test', 'salah')).status, 401);
  const res = await login('admin@mapala.test', 'password123');
  assert.equal(res.status, 429);
  assert.match(res.body.message, /Terlalu banyak percobaan/);
});
