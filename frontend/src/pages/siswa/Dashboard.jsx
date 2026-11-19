import { Link } from 'react-router-dom'
import { Card, EmptyState, Loadable, PageHeader, ProgressBar, StatCard, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatWaktu, periode } from '../../utils/format'
import BelumTerdaftar from './BelumTerdaftar'

export default function SiswaDashboard() {
  const { data, loading, error } = useFetch('/dashboard')

  return (
    <Loadable loading={loading} error={error}>
      {data && (
        <>
          <PageHeader title={`Halo, ${data.nama}`} subtitle="Ringkasan pendidikan Anda." />
          {!data.terdaftar ? <BelumTerdaftar /> : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Program diikuti" value={data.jumlah_program} />
                <div className="card p-4">
                  <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Progres modul</p>
                  <p className="mt-1 text-3xl font-semibold text-emerald-700">{data.progres.persen}%</p>
                  <p className="mt-1 text-xs text-stone-500">{data.progres.diakses} dari {data.progres.total} materi</p>
                </div>
                <div className="card p-4 sm:col-span-2">
                  <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Kehadiran</p>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                    {[['Hadir', 'hadir', 'text-emerald-700'], ['Izin', 'izin', 'text-sky-700'], ['Sakit', 'sakit', 'text-amber-700'], ['Alpa', 'alpa', 'text-red-700']].map(([l, k, c]) => (
                      <div key={k}><p className={`text-2xl font-semibold tabular-nums ${c}`}>{data.kehadiran[k]}</p><p className="text-xs text-stone-500">{l}</p></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Program saya" bodyClassName="p-0">
                  <ul className="divide-y divide-stone-100">
                    {data.program_saya.map((p) => (
                      <li key={p.id_program} className="space-y-2 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div><p className="font-medium text-stone-900">{p.nama_program}</p><p className="text-xs text-stone-500">{periode(p.tanggal_mulai, p.tanggal_selesai)}</p></div>
                          <Link to="/siswa/materi" className="btn-secondary btn-sm shrink-0">Buka materi</Link>
                        </div>
                        <ProgressBar value={p.persen} />
                        <p className="text-xs text-stone-500">{p.diakses} dari {p.total_materi} materi sudah dibuka</p>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card title="Jadwal terdekat" bodyClassName="p-0" actions={<Link to="/siswa/jadwal" className="btn-ghost btn-sm">Semua</Link>}>
                  {data.jadwal_terdekat.length === 0 ? <EmptyState>Tidak ada jadwal mendatang.</EmptyState> : (
                    <TableWrap>
                      <table className="table">
                        <tbody>
                          {data.jadwal_terdekat.map((j) => (
                            <tr key={j.id_jadwal}>
                              <td className="whitespace-nowrap">{formatTanggal(j.tanggal)}<p className="text-xs text-stone-500">{formatWaktu(j.waktu)}</p></td>
                              <td>{j.kegiatan}<p className="text-xs text-stone-500">{j.lokasi} · {j.nama_program}</p></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableWrap>
                  )}
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </Loadable>
  )
}
