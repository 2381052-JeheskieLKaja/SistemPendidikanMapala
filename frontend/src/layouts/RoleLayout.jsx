import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import NotificationBell from '../components/NotificationBell'
import { useAuth } from '../context/AuthContext'
import { label } from '../utils/labels'

// Menu navbar per role sesuai Tabel 4 (§4.2) dan todo Tahap 4.
const MENU = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/anggota', label: 'Data Anggota' },
    { to: '/admin/program', label: 'Program Pendidikan' },
    { to: '/admin/laporan', label: 'Laporan' },
    { to: '/admin/profil', label: 'Profil' },
  ],
  pengurus: [
    { to: '/pengurus/dashboard', label: 'Dashboard' },
    { to: '/pengurus/program', label: 'Program' },
    { to: '/pengurus/profil', label: 'Profil' },
  ],
  siswa: [
    { to: '/siswa/dashboard', label: 'Dashboard' },
    { to: '/siswa/materi', label: 'Materi' },
    { to: '/siswa/jadwal', label: 'Jadwal' },
    { to: '/siswa/absensi', label: 'Riwayat Absensi' },
    { to: '/siswa/progres', label: 'Progres' },
    { to: '/siswa/profil', label: 'Profil' },
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
          className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive ? 'bg-emerald-800 text-white' : 'text-emerald-50/80 hover:bg-emerald-800/60 hover:text-white'}`}
        >
          {item.label}
        </NavLink>
      ))}
      <Link to="/publik" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-emerald-50/60 hover:bg-emerald-800/60 hover:text-white">
        Info Publik ↗
      </Link>
    </nav>
  )

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-emerald-950 p-4 text-white lg:flex">
        <Brand className="mb-8 px-1" />
        {nav}
        <div className="mt-auto border-t border-emerald-800 pt-4 text-sm">
          <p className="truncate font-medium">{user.nama}</p>
          <p className="text-xs text-emerald-200/70">{label(user.role)}</p>
          <button type="button" onClick={handleLogout} className="mt-3 w-full rounded-lg bg-emerald-800 px-3 py-2 text-sm hover:bg-emerald-700">
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-stone-200 bg-white/90 px-4 py-2 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <button type="button" className="rounded-lg p-2 text-stone-700 hover:bg-stone-100" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Buka menu">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
            </button>
            <Brand className="text-stone-900" subtitle={label(user.role)} />
          </div>
          <p className="hidden text-sm text-stone-500 lg:block">Masuk sebagai <span className="font-medium text-stone-800">{user.nama}</span> · {label(user.role)}</p>
          <div className="flex items-center gap-1">
            {role === 'siswa' && <NotificationBell />}
            <button type="button" onClick={handleLogout} className="btn-ghost btn-sm lg:hidden">Logout</button>
          </div>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" className="absolute inset-0 bg-stone-900/40" onClick={() => setOpen(false)} aria-label="Tutup menu" />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-emerald-950 p-4 text-white">
              <Brand className="mb-6 px-1" />
              {nav}
              <div className="mt-auto border-t border-emerald-800 pt-4 text-sm">
                <p className="truncate font-medium">{user.nama}</p>
                <button type="button" onClick={handleLogout} className="mt-3 w-full rounded-lg bg-emerald-800 px-3 py-2">Logout</button>
              </div>
            </div>
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8">
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
