const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const authMiddleware = require('./middlewares/authMiddleware');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

// ---- Endpoint publik (tanpa token): hanya login dan informasi publik ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/publik', require('./routes/publik'));

// ---- Semua endpoint di bawah ini wajib authMiddleware; role diperiksa per route ----
app.use('/api', authMiddleware);
app.use('/api/anggota', require('./routes/anggota'));
app.use('/api/program', require('./routes/program'));
app.use('/api/kurikulum', require('./routes/kurikulum'));
app.use('/api/materi', require('./routes/materi'));
app.use('/api/jadwal', require('./routes/jadwal'));
app.use('/api/peserta', require('./routes/peserta'));
app.use('/api/absensi', require('./routes/absensi'));
app.use('/api/evaluasi', require('./routes/evaluasi'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/progres', require('./routes/progres'));
app.use('/api/notifikasi', require('./routes/notifikasi'));
app.use('/api/profil', require('./routes/profil'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('/api', notFoundHandler);
app.use(errorHandler);

module.exports = app;
