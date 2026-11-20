import { Link } from 'react-router-dom'
import { Card, EmptyState, Loadable, PageHeader, StatCard, TableWrap } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatWaktu, hariIni, periode } from '../../utils/format'
import { STATUS_KEANGGOTAAN, label } from '../../utils/labels'

/** Dashboard Admin dan Pengurus (wireframe "Admin/Pengurus", Gambar 21). */
export default function DashboardPengelola() {
  const { user } = useAuth()
  const { data, loading, error } = useFetch('/dashboard')
  const isAdmin = user.role === 'admin'
  const base = `/${user.role}`

  return (
    <>
      <PageHeader title={`Halo, ${label(user.role)}`} subtitle={`Ringkasan pendidikan MAPALA per ${formatTanggal(hariIni(), { hari: true })}.`} />
      <Loadable loading={loading} error={error}>
        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total anggota" value={data.total_anggota} />
              <StatCard label="Program aktif" value={data.program_aktif.length} accent="sky" />
              <StatCard label="Jadwal terdekat" value={data.jadwal_terdekat.length} accent="amber" hint="Ditampilkan maksimal 5 kegiatan" />
            </div>

            <Card title="Anggota per tahapan keanggotaan" bodyClassName="p-0"
              actions={isAdmin && <Link to="/admin/anggota" className="btn-ghost btn-sm">Kelola</Link>}>
              <div className="grid grid-cols-2 divide-x divide-y divide-stone-100 sm:grid-cols-4 lg:grid-cols-7 lg:divide-y-0 dark:divide-[#383838]/75">
                {STATUS_KEANGGOTAAN.map((s) => (
                  <div key={s} className="px-4 py-3.5 transition-colors duration-150 hover:bg-stone-50/75 dark:hover:bg-[#2B2B2B]/65">
                    <p className="truncate text-xs text-stone-500 dark:text-[#A3A3A3]">{label(s)}</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight text-stone-900 tabular-nums dark:text-[#F2F2F2]">{data.rincian_keanggotaan[s]}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Card title="Program aktif" bodyClassName="p-0">
                {data.program_aktif.length === 0 ? <EmptyState>Tidak ada program yang sedang berjalan.</EmptyState> : (
                  <ul className="divide-y divide-stone-100 dark:divide-[#383838]/75">
                    {data.program_aktif.map((p) => (
                      <li key={p.id_program} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-stone-50/70 dark:hover:bg-[#2B2B2B]/65">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-900 dark:text-[#F2F2F2]">{p.nama_program}</p>
                          <p className="mt-0.5 text-xs text-stone-500 dark:text-[#A3A3A3]">{periode(p.tanggal_mulai, p.tanggal_selesai)} · {p.jumlah_peserta} peserta</p>
                        </div>
                        <Link to={`${base}/program/${p.id_program}`} className="btn-secondary btn-sm shrink-0">Buka</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Jadwal terdekat" bodyClassName="p-0">
                {data.jadwal_terdekat.length === 0 ? <EmptyState>Tidak ada jadwal mendatang.</EmptyState> : (
                  <TableWrap>
                    <table className="table">
                      <thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Lokasi</th></tr></thead>
                      <tbody>
                        {data.jadwal_terdekat.map((j) => (
                          <tr key={j.id_jadwal}>
                            <td className="whitespace-nowrap">
                              <span className="font-medium text-stone-800 dark:text-[#F2F2F2]">{formatTanggal(j.tanggal)}</span>
                              <p className="mt-0.5 text-xs text-stone-500 tabular-nums dark:text-[#A3A3A3]">{formatWaktu(j.waktu)}</p>
                            </td>
                            <td>
                              <span className="font-medium text-stone-800 dark:text-[#F2F2F2]">{j.kegiatan}</span>
                              <p className="mt-0.5 text-xs text-stone-500 dark:text-[#A3A3A3]">{j.nama_program}</p>
                            </td>
                            <td className="text-stone-600 dark:text-[#A3A3A3]">{j.lokasi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableWrap>
                )}
              </Card>
            </div>

            {!isAdmin && (
              <Card title="Aksi cepat">
                <p className="mb-3 text-sm text-stone-600 dark:text-[#A3A3A3]">Pilih program untuk mengelola materi, jadwal, absensi, dan evaluasi.</p>
                <Link to="/pengurus/program" className="btn-primary">Pilih program</Link>
              </Card>
            )}
          </div>
        )}
      </Loadable>
    </>
  )
}
