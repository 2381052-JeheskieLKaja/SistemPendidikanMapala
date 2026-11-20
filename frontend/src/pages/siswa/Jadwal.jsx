import { Card, EmptyState, Loadable, PageHeader, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatWaktu, hariIni } from '../../utils/format'

function Tabel({ rows }) {
  return (
    <TableWrap>
      <table className="table">
        <thead><tr><th>Tanggal</th><th>Waktu</th><th>Kegiatan</th><th>Lokasi</th><th>Program</th></tr></thead>
        <tbody>
          {rows.map((j) => (
            <tr key={j.id_jadwal}>
              <td className="whitespace-nowrap font-medium text-stone-800 dark:text-[#F2F2F2]">{formatTanggal(j.tanggal, { hari: true })}</td>
              <td className="tabular-nums text-stone-600 dark:text-[#A3A3A3]">{formatWaktu(j.waktu)}</td>
              <td className="font-medium text-stone-900 dark:text-[#F2F2F2]">{j.kegiatan}</td>
              <td className="text-stone-600 dark:text-[#A3A3A3]">{j.lokasi}</td>
              <td className="text-stone-500 dark:text-[#737373]">{j.nama_program}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

export default function SiswaJadwal() {
  const { data: jadwal, loading, error } = useFetch('/jadwal/saya', [])
  const today = hariIni()
  const mendatang = jadwal.filter((j) => j.tanggal >= today)
  const lewat = jadwal.filter((j) => j.tanggal < today).reverse()

  return (
    <>
      <PageHeader title="Jadwal" subtitle="Jadwal kegiatan dari program yang Anda ikuti." />
      <Loadable loading={loading} error={error}>
        {jadwal.length === 0 ? <Card><EmptyState>Tidak ada jadwal.</EmptyState></Card> : (
          <div className="space-y-6">
            <Card title={`Mendatang (${mendatang.length})`} bodyClassName="p-0">
              {mendatang.length === 0 ? <EmptyState>Tidak ada jadwal mendatang.</EmptyState> : <Tabel rows={mendatang} />}
            </Card>
            <Card title={`Sudah lewat (${lewat.length})`} bodyClassName="p-0">
              {lewat.length === 0 ? <EmptyState>Belum ada kegiatan yang lewat.</EmptyState> : <Tabel rows={lewat} />}
            </Card>
          </div>
        )}
      </Loadable>
    </>
  )
}
