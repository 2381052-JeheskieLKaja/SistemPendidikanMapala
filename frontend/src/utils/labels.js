const LABELS = {
  admin: 'Admin', pengurus: 'Pengurus', siswa: 'Siswa',
  calon_siswa: 'Calon Siswa', calon_anggota: 'Calon Anggota', anggota: 'Anggota',
  ppa: 'PPA', dp: 'DP', pemburu_tua: 'Pemburu Tua',
  aktif: 'Aktif', nonaktif: 'Nonaktif', selesai: 'Selesai',
  rutin: 'Rutin', tambahan: 'Tambahan',
  draft: 'Draft', diresmikan: 'Diresmikan',
  hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpa: 'Alpa',
  sudah_diakses: 'Sudah diakses', belum_diakses: 'Belum diakses',
}

/** Kode enum → label tampilan. */
export const label = (value) => LABELS[value] || value

/** Tahapan keanggotaan sesuai enum §11.2 (urut tahapan). */
export const STATUS_KEANGGOTAAN = ['calon_siswa', 'siswa', 'calon_anggota', 'anggota', 'ppa', 'dp', 'pemburu_tua']
export const STATUS_ABSENSI = ['hadir', 'izin', 'sakit', 'alpa']

export const toOptions = (values) => values.map((v) => ({ value: v, label: label(v) }))

/** Kelompokkan array berdasarkan key → [[key, items[]], ...] dengan urutan kemunculan. */
export function groupBy(items, key) {
  const map = new Map()
  items.forEach((it) => {
    const k = typeof key === 'function' ? key(it) : it[key]
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(it)
  })
  return [...map.entries()]
}
