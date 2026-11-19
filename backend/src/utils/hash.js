const crypto = require('crypto');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

/** Password sementara 10 karakter (tanpa karakter yang mudah tertukar) untuk akun Siswa baru (K7). */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from(crypto.randomBytes(10), (b) => chars[b % chars.length]).join('');
}

module.exports = { hashPassword, comparePassword, generateTempPassword };
