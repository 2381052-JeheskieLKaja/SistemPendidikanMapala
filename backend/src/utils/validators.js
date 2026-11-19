const { badRequest } = require('./response');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const isEmail = (v) => EMAIL_RE.test(String(v));
function isDate(v) {
  if (!DATE_RE.test(String(v))) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
const isTime = (v) => TIME_RE.test(String(v));

/**
 * Validasi body berdasarkan aturan per field.
 * rules: { field: { required, type: 'string'|'email'|'int'|'date'|'time'|'enum', values, max, min, label } }
 * Mengembalikan objek berisi field yang dikenal saja (string di-trim, '' → null).
 * Field yang tidak ada di rules diabaikan (mencegah mass-assignment). Error → 400 dengan pesan per field.
 */
function validate(body, rules) {
  const src = body && typeof body === 'object' ? body : {};
  const out = {};
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    let value = src[field];
    if (typeof value === 'string') value = value.trim();
    const label = rule.label || field;

    if (value === undefined || value === null || value === '') {
      if (rule.required) errors[field] = `${label} wajib diisi`;
      else out[field] = null;
      continue;
    }

    switch (rule.type || 'string') {
      case 'email':
        value = String(value).toLowerCase();
        if (!isEmail(value)) errors[field] = 'Format email tidak valid';
        else if (value.length > (rule.max || 100)) errors[field] = `${label} maksimal ${rule.max || 100} karakter`;
        break;
      case 'int':
        value = Number(value);
        if (!Number.isInteger(value) || value < (rule.min ?? 1)) errors[field] = `${label} tidak valid`;
        break;
      case 'date':
        if (!isDate(value)) errors[field] = `${label} harus berformat tanggal YYYY-MM-DD`;
        break;
      case 'time':
        if (!isTime(value)) errors[field] = `${label} harus berformat waktu HH:MM`;
        break;
      case 'enum':
        if (!rule.values.includes(value)) errors[field] = `${label} harus salah satu dari: ${rule.values.join(', ')}`;
        break;
      default:
        value = String(value);
        if (rule.max && value.length > rule.max) errors[field] = `${label} maksimal ${rule.max} karakter`;
        if (rule.min && value.length < rule.min) errors[field] = `${label} minimal ${rule.min} karakter`;
    }
    out[field] = value;
  }

  if (Object.keys(errors).length) throw badRequest('Data tidak valid', errors);
  return out;
}

/** Parameter id (path/query) wajib bilangan bulat positif. */
function toId(value, label = 'ID') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw badRequest(`${label} tidak valid`);
  return n;
}

const STATUS_KEANGGOTAAN = ['calon_siswa', 'siswa', 'calon_anggota', 'anggota', 'ppa', 'dp', 'pemburu_tua'];
const STATUS_ABSENSI = ['hadir', 'izin', 'sakit', 'alpa'];

module.exports = { validate, toId, isEmail, isDate, isTime, STATUS_KEANGGOTAAN, STATUS_ABSENSI };
