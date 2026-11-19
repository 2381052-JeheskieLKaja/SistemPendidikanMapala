import { Link } from 'react-router-dom'
import { Badge, EmptyState, Loadable, PageHeader } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { hariIni, periode } from '../../utils/format'
import { label } from '../../utils/labels'

/** Daftar program read-only untuk dipilih Pengurus sebelum membuka Materi/Jadwal/Absensi/Evaluasi. */
export default function ProgramList() {
  const { data: program, loading, error } = useFetch('/program', [])
  const today = hariIni()

  return (
    <>
      <PageHeader title="Program" subtitle="Pilih program untuk mengelola materi, jadwal, absensi, dan evaluasi." />
      <Loadable loading={loading} error={error}>
        {program.length === 0 ? <div className="card"><EmptyState>Belum ada program pendidikan.</EmptyState></div> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {program.map((p) => {
              const aktif = p.tanggal_mulai && p.tanggal_selesai && p.tanggal_mulai <= today && today <= p.tanggal_selesai
              return (
                <Link key={p.id_program} to={`/pengurus/program/${p.id_program}`}
                  className="card flex flex-col gap-2 p-4 transition hover:border-emerald-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-emerald-600">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-stone-900">{p.nama_program}</h2>
                    <Badge color={p.jenis === 'rutin' ? 'blue' : 'purple'}>{label(p.jenis)}</Badge>
                  </div>
                  <p className="text-sm text-stone-500">{periode(p.tanggal_mulai, p.tanggal_selesai)}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2 text-xs text-stone-600">
                    {aktif && <Badge color="green">Sedang berjalan</Badge>}
                    <span>{p.jumlah_peserta} peserta</span>·<span>{p.jumlah_materi} materi</span>·<span>{p.jumlah_jadwal} jadwal</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Loadable>
    </>
  )
}
