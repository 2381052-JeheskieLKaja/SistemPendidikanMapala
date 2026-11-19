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
      <Link to={backTo} className="text-sm text-emerald-700 hover:underline">← Daftar program</Link>
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold text-stone-900 sm:text-2xl">{program.nama_program}</h1>
        <Badge color={program.jenis === 'rutin' ? 'blue' : 'purple'}>{label(program.jenis)}</Badge>
      </div>
      <p className="-mt-2 mb-4 text-sm text-stone-500">{periode(program.tanggal_mulai, program.tanggal_selesai)} · {program.jumlah_peserta} peserta</p>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-stone-200" aria-label="Menu kelola program">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to}
            className={({ isActive }) => `-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${
              isActive ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-800'}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet context={{ program, reloadProgram: reload }} />
    </>
  )
}
