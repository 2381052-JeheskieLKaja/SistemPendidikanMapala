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
                  className="card flex flex-col justify-between gap-4 bg-gradient-to-b from-white to-stone-50/35 p-5 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-emerald-600/50 hover:shadow-[0_8px_20px_-6px_rgba(6,78,59,0.12)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:from-[#2B2B2B]/65 dark:to-[#242424] dark:hover:border-[#4A4A4A] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)] dark:focus-visible:outline-emerald-500">
                  <div>
                    <div className="flex items-start justify-between gap-2.5">
                      <h2 className="font-semibold tracking-tight text-stone-900 dark:text-[#F2F2F2]">{p.nama_program}</h2>
                      <Badge color={p.jenis === 'rutin' ? 'blue' : 'purple'}>{label(p.jenis)}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-stone-500 dark:text-[#A3A3A3]">{periode(p.tanggal_mulai, p.tanggal_selesai)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600 tabular-nums dark:border-[#383838]/75 dark:text-[#A3A3A3]">
                    {aktif && <Badge color="green">Sedang berjalan</Badge>}
                    <span>{p.jumlah_peserta} peserta</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.jumlah_materi} materi</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.jumlah_jadwal} jadwal</span>
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
