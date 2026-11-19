const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function parseDate(value) {
  if (!value) return null
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** '2026-09-05' → '5 Sep 2026' (atau dengan nama hari). */
export function formatTanggal(value, { hari = false } = {}) {
  const date = parseDate(value)
  if (!date) return '-'
  const base = `${date.getDate()} ${BULAN[date.getMonth()]} ${date.getFullYear()}`
  return hari ? `${HARI[date.getDay()]}, ${base}` : base
}

/** '08:00:00' → '08.00' */
export function formatWaktu(value) {
  return value ? String(value).slice(0, 5).replace(':', '.') : '-'
}

/** '2026-09-05 10:11:12' → '5 Sep 2026 10.11' */
export function formatTanggalWaktu(value) {
  if (!value) return '-'
  return `${formatTanggal(value)} ${formatWaktu(String(value).slice(11, 16))}`
}

export function periode(mulai, selesai) {
  if (!mulai && !selesai) return 'Belum ditentukan'
  return `${formatTanggal(mulai)} – ${formatTanggal(selesai)}`
}

/** Hari ini dalam format YYYY-MM-DD (zona waktu lokal). */
export function hariIni() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

