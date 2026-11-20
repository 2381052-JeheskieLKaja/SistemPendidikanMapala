import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import NotificationBell from '../components/NotificationBell'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { label } from '../utils/labels'

const ICONS = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  anggota: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  program: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  laporan: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  materi: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  jadwal: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  absensi: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  progres: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  profil: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  publik: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
}

function NavIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 opacity-80" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d={ICONS[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Menu navbar per role sesuai Tabel 4 (§4.2) dan todo Tahap 4.
const MENU = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/anggota', label: 'Data Anggota', icon: 'anggota' },
    { to: '/admin/program', label: 'Program Pendidikan', icon: 'program' },
    { to: '/admin/laporan', label: 'Laporan', icon: 'laporan' },
    { to: '/admin/profil', label: 'Profil', icon: 'profil' },
  ],
  pengurus: [
    { to: '/pengurus/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/pengurus/program', label: 'Program', icon: 'program' },
    { to: '/pengurus/profil', label: 'Profil', icon: 'profil' },
  ],
  siswa: [
    { to: '/siswa/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/siswa/materi', label: 'Materi', icon: 'materi' },
    { to: '/siswa/jadwal', label: 'Jadwal', icon: 'jadwal' },
    { to: '/siswa/absensi', label: 'Riwayat Absensi', icon: 'absensi' },
    { to: '/siswa/progres', label: 'Progres', icon: 'progres' },
    { to: '/siswa/profil', label: 'Profil', icon: 'profil' },
  ],
}

function RoleLayout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Menu utama">
      {MENU[role].map((item) => (
        <NavLink
          key={item.to} to={item.to} onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
            isActive
              ? 'bg-gradient-to-r from-emerald-800/95 to-emerald-800/70 text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-emerald-700/50 dark:from-[#2B2B2B] dark:to-[#242424] dark:text-[#F2F2F2] dark:ring-[#383838] [&>svg]:dark:text-emerald-400'
              : 'text-emerald-100/75 hover:bg-emerald-900/75 hover:text-white dark:text-[#A3A3A3] dark:hover:bg-[#2B2B2B] dark:hover:text-[#F2F2F2]'}`}
        >
          <NavIcon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <div className="my-2 border-t border-emerald-900/80 dark:border-[#383838]" />
      <Link to="/publik" onClick={() => setOpen(false)}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-emerald-100/60 transition-all duration-150 hover:bg-emerald-900/75 hover:text-white dark:text-[#737373] dark:hover:bg-[#2B2B2B] dark:hover:text-[#F2F2F2]">
        <NavIcon name="publik" />
        <span>Info Publik</span>
      </Link>
    </nav>
  )

  return (
    <div className="min-h-screen bg-stone-50 transition-colors duration-250 dark:bg-[#171717] lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-emerald-900/50 bg-gradient-to-b from-emerald-950 via-emerald-950 to-[#032e22] p-4 text-white transition-colors duration-250 dark:border-[#383838] dark:from-[#1C1C1C] dark:via-[#1C1C1C] dark:to-[#181818] lg:flex">
        <div className="mb-7 px-1 pt-1">
          <Brand />
        </div>
        {nav}
        <div className="mt-auto border-t border-emerald-900/80 pt-4 text-sm dark:border-[#383838]">
          <div className="px-1">
            <p className="truncate font-medium text-white dark:text-[#F2F2F2]">{user.nama}</p>
            <p className="text-xs text-emerald-200/70 dark:text-[#A3A3A3]">{label(user.role)}</p>
          </div>
          <button type="button" onClick={handleLogout}
            className="mt-3 w-full cursor-pointer rounded-lg border border-emerald-800/80 bg-emerald-900/50 px-3 py-2 text-sm font-medium text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-150 hover:border-emerald-700 hover:bg-emerald-800/80 hover:text-white active:translate-y-px dark:border-[#383838] dark:bg-[#242424] dark:text-[#F2F2F2] dark:hover:border-[#4A4A4A] dark:hover:bg-[#2B2B2B] dark:hover:text-white">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-stone-200/80 bg-white/95 px-4 shadow-[0_1px_2px_rgba(28,25,23,0.03)] backdrop-blur transition-colors duration-250 dark:border-[#383838] dark:bg-[#1C1C1C]/95 dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)] sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
            <button type="button" className="-ml-1.5 flex size-9 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 dark:text-[#F2F2F2] dark:hover:bg-[#2B2B2B]"
              onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Buka menu">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
            </button>
            <Brand className="text-stone-900 dark:text-[#F2F2F2]" subtitle={label(user.role)} />
          </div>
          <p className="hidden text-sm text-stone-500 dark:text-[#A3A3A3] lg:block">
            Masuk sebagai <span className="font-medium text-stone-800 dark:text-[#F2F2F2]">{user.nama}</span> · {label(user.role)}
          </p>
          <div className="flex items-center gap-2">
            {role === 'siswa' && <NotificationBell />}
            <button type="button" onClick={handleLogout} className="btn-ghost btn-sm lg:hidden">Logout</button>
            <ThemeToggle />
          </div>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" className="absolute inset-0 bg-stone-900/50 backdrop-blur-[2px] dark:bg-black/75" onClick={() => setOpen(false)} aria-label="Tutup menu" />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-emerald-900/50 bg-gradient-to-b from-emerald-950 via-emerald-950 to-[#032e22] p-4 text-white shadow-xl dark:border-[#383838] dark:from-[#1C1C1C] dark:via-[#1C1C1C] dark:to-[#181818]">
              <div className="mb-6 flex items-center justify-between px-1 pt-1">
                <Brand />
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-emerald-200 transition hover:bg-emerald-900 hover:text-white dark:text-[#A3A3A3] dark:hover:bg-[#2B2B2B] dark:hover:text-[#F2F2F2]" aria-label="Tutup menu">✕</button>
              </div>
              {nav}
              <div className="mt-auto border-t border-emerald-900/80 pt-4 text-sm dark:border-[#383838]">
                <p className="truncate px-1 font-medium dark:text-[#F2F2F2]">{user.nama}</p>
                <p className="px-1 text-xs text-emerald-200/70 dark:text-[#A3A3A3]">{label(user.role)}</p>
                <button type="button" onClick={handleLogout}
                  className="mt-3 w-full cursor-pointer rounded-lg border border-emerald-800/80 bg-emerald-900/50 px-3 py-2 text-sm font-medium text-emerald-100 transition-all duration-150 hover:bg-emerald-800/80 hover:text-white dark:border-[#383838] dark:bg-[#242424] dark:text-[#F2F2F2] dark:hover:border-[#4A4A4A] dark:hover:bg-[#2B2B2B] dark:hover:text-white">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export const AdminLayout = () => <RoleLayout role="admin" />
export const PengurusLayout = () => <RoleLayout role="pengurus" />
export const SiswaLayout = () => <RoleLayout role="siswa" />
