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
                <StatCard label="Progres modul" value={`${data.progres.persen}%`} hint={`${data.progres.diakses} dari ${data.progres.total} materi`} />
                <div className="card flex flex-col justify-between bg-gradient-to-b from-emerald-50/30 via-white to-white p-5 transition-all duration-150 hover:border-stone-300/90 hover:shadow-[0_4px_12px_-2px_rgba(28,25,23,0.06)] sm:col-span-2 dark:from-[#2B2B2B] dark:via-[#242424] dark:to-[#242424] dark:hover:border-[#4A4A4A] dark:hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45)]">
                  <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-[#A3A3A3]">Kehadiran</p>
                  <div className="mt-3 grid grid-cols-4 divide-x divide-stone-100 text-center dark:divide-[#383838]/75">
                    {[['Hadir', 'hadir', 'text-emerald-700 dark:text-emerald-400'], ['Izin', 'izin', 'text-sky-700 dark:text-[#F2F2F2]'], ['Sakit', 'sakit', 'text-amber-700 dark:text-amber-400'], ['Alpa', 'alpa', 'text-red-700 dark:text-red-400']].map(([l, k, c]) => (
                      <div key={k} className="px-2">
                        <p className={`text-2xl font-semibold tracking-tight tabular-nums ${c}`}>{data.kehadiran[k]}</p>
                        <p className="mt-0.5 text-xs text-stone-500 dark:text-[#A3A3A3]">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid items-start gap-6 lg:grid-cols-2">
                <Card title="Program saya" bodyClassName="p-0">
                  <ul className="divide-y divide-stone-100 dark:divide-[#383838]/75">
                    {data.program_saya.map((p) => (
                      <li key={p.id_program} className="space-y-2.5 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{p.nama_program}</p>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-[#A3A3A3]">{periode(p.tanggal_mulai, p.tanggal_selesai)}</p>
                          </div>
                          <Link to="/siswa/materi" className="btn-secondary btn-sm shrink-0">Buka materi</Link>
                        </div>
                        <ProgressBar value={p.persen} />
                        <p className="text-xs text-stone-500 tabular-nums dark:text-[#737373]">{p.diakses} dari {p.total_materi} materi sudah dibuka</p>
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
                              <td className="whitespace-nowrap">
                                <span className="font-medium text-stone-800 dark:text-[#F2F2F2]">{formatTanggal(j.tanggal)}</span>
                                <p className="mt-0.5 text-xs text-stone-500 tabular-nums dark:text-[#A3A3A3]">{formatWaktu(j.waktu)}</p>
                              </td>
                              <td>
                                <span className="font-medium text-stone-800 dark:text-[#F2F2F2]">{j.kegiatan}</span>
                                <p className="mt-0.5 text-xs text-stone-500 dark:text-[#A3A3A3]">{j.lokasi} · {j.nama_program}</p>
                              </td>
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
