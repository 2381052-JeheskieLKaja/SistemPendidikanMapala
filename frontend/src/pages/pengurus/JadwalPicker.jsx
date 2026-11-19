import { Card, EmptyState, Loadable } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatWaktu } from '../../utils/format'

/** Pilih satu jadwal (kegiatan) program — dipakai halaman Absensi dan Evaluasi. */
export default function JadwalPicker({ idProgram, value, onChange }) {
  const { data: jadwal, loading, error } = useFetch(`/jadwal?id_program=${idProgram}`, [])
  return (
    <Card className="mb-6">
      <Loadable loading={loading} error={error}>
        {jadwal.length === 0 ? <EmptyState>Belum ada jadwal kegiatan. Tambahkan jadwal terlebih dahulu di tab Jadwal.</EmptyState> : (
          <div>
            <label htmlFor="pilih-jadwal" className="label">Kegiatan</label>
            <select id="pilih-jadwal" className="input" value={value} onChange={(e) => onChange(e.target.value)}>
              <option value="">— Pilih kegiatan —</option>
              {jadwal.map((j) => (
                <option key={j.id_jadwal} value={j.id_jadwal}>
                  {formatTanggal(j.tanggal)} {formatWaktu(j.waktu)} · {j.kegiatan} ({j.lokasi})
                </option>
              ))}
            </select>
          </div>
        )}
      </Loadable>
    </Card>
  )
}
