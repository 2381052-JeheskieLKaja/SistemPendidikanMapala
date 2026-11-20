import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-stone-50 to-stone-100/70 p-6 text-center transition-colors duration-250 dark:from-[#171717] dark:to-[#121212]">
      <ThemeToggle className="fixed top-4 right-4 sm:top-5 sm:right-6" />
      <p className="text-5xl font-bold tracking-tight text-emerald-800 tabular-nums dark:text-emerald-400">404</p>
      <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-[#F2F2F2]">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm leading-relaxed text-stone-500 dark:text-[#A3A3A3]">Periksa kembali alamat URL atau kembali ke dashboard.</p>
      <Link to="/dashboard" className="btn-primary mt-1">Kembali</Link>
    </div>
  )
}
