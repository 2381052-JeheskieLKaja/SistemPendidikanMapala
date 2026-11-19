import { Card, EmptyState, Loadable, PageHeader, StatCard, StatusBadge, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatWaktu } from '../../utils/format'

export default function RiwayatAbsensi() {
  const { data, loading, error } = useFetch('/absensi/saya')

  return (
    <>
      <PageHeader title="Riwayat Absensi" subtitle="Rekap kehadiran Anda pada setiap kegiatan." />
      <Loadable loading={loading} error={error}>
        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Hadir" value={data.rekap.hadir} />
              <StatCard label="Izin" value={data.rekap.izin} accent="sky" />
              <StatCard label="Sakit" value={data.rekap.sakit} accent="amber" />
              <StatCard label="Alpa" value={data.rekap.alpa} accent="stone" />
            </div>
            <Card title="Riwayat" bodyClassName="p-0">
              {data.riwayat.length === 0 ? <EmptyState>Belum ada riwayat absensi.</EmptyState> : (
                <TableWrap>
                  <table className="table">
                    <thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Program</th><th>Status</th><th>Keterangan</th></tr></thead>
                    <tbody>
                      {data.riwayat.map((r) => (
                        <tr key={r.id_absensi}>
                          <td className="whitespace-nowrap">{formatTanggal(r.tanggal)}<p className="text-xs text-stone-500">{formatWaktu(r.waktu)}</p></td>
                          <td>{r.kegiatan}<p className="text-xs text-stone-500">{r.lokasi}</p></td>
                          <td>{r.nama_program}</td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>{r.keterangan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </Card>
          </div>
        )}
      </Loadable>
    </>
  )
}
