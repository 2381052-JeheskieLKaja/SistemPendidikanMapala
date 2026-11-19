// Helper pengujian Black Box level API: hanya memeriksa masukan (request) dan keluaran (status + body).
process.env.NODE_ENV = 'test';
process.env.LOGIN_RATE_MAX ||= '1000';

const request = require('supertest');
const { reset } = require('../db/reset');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const PASSWORD = 'password123';
const tokens = {};

async function login(email, password = PASSWORD) {
  return request(app).post('/api/auth/login').send({ email, password });
}

async function token(email) {
  if (!tokens[email]) {
    const res = await login(email);
    if (res.status !== 200) throw new Error(`Login ${email} gagal: ${res.status}`);
    tokens[email] = res.body.data.token;
  }
  return tokens[email];
}

/** call('admin', 'get', '/api/anggota') — role dipetakan ke akun seed. */
const AKUN = { admin: 'admin@mapala.test', pengurus: 'pengurus@mapala.test', budi: 'budi@mapala.test', sari: 'sari@mapala.test', andi: 'andi@mapala.test' };
async function call(who, method, url, body) {
  const req = request(app)[method](url);
  if (who) req.set('Authorization', `Bearer ${await token(AKUN[who] || who)}`);
  return body === undefined ? req : req.send(body);
}

/** Request multipart: fields = { judul, ... }, file = { buffer, name } (opsional). */
async function upload(who, method, url, fields, file) {
  const req = request(app)[method](url).set('Authorization', `Bearer ${await token(AKUN[who] || who)}`);
  for (const [k, v] of Object.entries(fields)) req.field(k, String(v));
  if (file) req.attach('file', file.buffer, file.name);
  return req;
}

async function resetDb() {
  await reset();
  // Berkas uji hanya ada di folder khusus test (uploads-test/), dikosongkan agar tidak menumpuk.
  const dir = require('../src/config/env').uploadDir;
  for (const f of require('fs').readdirSync(dir)) require('fs').rmSync(require('path').join(dir, f), { force: true });
  for (const k of Object.keys(tokens)) delete tokens[k];
}

const q = async (sql, params) => (await pool.query(sql, params))[0];

module.exports = { app, request, pool, login, token, call, upload, resetDb, q, PASSWORD };
