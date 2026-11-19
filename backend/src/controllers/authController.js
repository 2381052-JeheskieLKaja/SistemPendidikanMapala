const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { pool } = require("../config/db");
const { comparePassword } = require("../utils/hash");
const { ok, unauthorized, forbidden } = require("../utils/response");
const { validate } = require("../utils/validators");

/** POST /api/auth/login */
async function login(req, res) {
  const { email, password } = validate(req.body, {
    email: { required: true, type: "email", label: "Email" },
    password: { required: true, label: "Password" },
  });

  const [rows] = await pool.query(
    "SELECT id_user, nama, password, role, status FROM users WHERE email = ?",
    [email],
  );
  const user = rows[0];
  const match = await comparePassword(
    password,
    user ? user.password : DUMMY_HASH,
  );
  if (!user || !match) throw unauthorized("Email atau password salah");
  if (user.status !== "aktif") throw forbidden("Akun tidak aktif");

  const token = jwt.sign(
    { id_user: user.id_user, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
  return ok(
    res,
    {
      token,
      role: user.role,
      user: { id_user: user.id_user, nama: user.nama, role: user.role },
    },
    "Login berhasil",
  );
}

module.exports = { login };
