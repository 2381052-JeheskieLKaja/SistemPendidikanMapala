import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { Alert, Badge, Spinner } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { periode } from '../../utils/format'
import { label } from '../../utils/labels'

/** Header program + tab menu kelola. Data program diteruskan ke halaman anak lewat Outlet context. */
export default function ProgramKelolaLayout({ tabs, backTo }) {
  const { id } = useParams()
  const { data: program, loading, error, reload } = useFetch(`/program/${id}`)

  // Spinner hanya saat muat pertama agar reload header tidak me-reset halaman anak.
  const sama = program && String(program.id_program) === id
  if (loading && !sama) return <Spinner />
  if (error || !sama) return <><Alert>{error}</Alert><Link to={backTo} className="btn-secondary">← Kembali ke daftar program</Link></>

  return (
    <>
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
        ← Daftar program
      </Link>
      <div className="mt-3 mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-stone-900 sm:text-[1.75rem] dark:text-[#F2F2F2]">{program.nama_program}</h1>
          <Badge color={program.jenis === 'rutin' ? 'blue' : 'purple'}>{label(program.jenis)}</Badge>
        </div>
        <p className="mt-1.5 text-sm font-normal text-stone-500 dark:text-[#A3A3A3]">{periode(program.tanggal_mulai, program.tanggal_selesai)} · {program.jumlah_peserta} peserta</p>
      </div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-stone-200 dark:border-[#383838]" aria-label="Menu kelola program">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to}
            className={({ isActive }) => `-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
              isActive ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-[#F2F2F2]' : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-[#A3A3A3] dark:hover:text-[#F2F2F2]'}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet context={{ program, reloadProgram: reload }} />
    </>
  )
}
