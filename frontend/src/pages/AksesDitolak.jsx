import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { dashboardPath, useAuth } from '../context/AuthContext'
import { label } from '../utils/labels'

/** Ditampilkan bila role membuka halaman milik aktor lain (mis. Siswa membuka /admin/anggota, TC-21). */
export default function AksesDitolak() {
  const { user } = useAuth()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-stone-50 to-stone-100/70 p-6 text-center transition-colors duration-250 dark:from-[#171717] dark:to-[#121212]" role="alert">
      <ThemeToggle className="fixed top-4 right-4 sm:top-5 sm:right-6" />
      <p className="text-5xl font-bold tracking-tight text-red-700 tabular-nums dark:text-red-400">403</p>
      <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-[#F2F2F2]">Akses ditolak</h1>
      <p className="max-w-md text-sm leading-relaxed text-stone-600 dark:text-[#A3A3A3]">
        Anda tidak memiliki hak akses ke halaman ini. Halaman ini bukan untuk peran {label(user.role)}.
      </p>
      <Link to={dashboardPath(user.role)} className="btn-primary mt-1">Kembali ke dashboard saya</Link>
    </div>
  )
}
