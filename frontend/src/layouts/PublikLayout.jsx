import { Link, Outlet } from 'react-router-dom'
import Brand from '../components/Brand'
import ThemeToggle from '../components/ThemeToggle'
import { dashboardPath, useAuth } from '../context/AuthContext'

export default function PublikLayout() {
  const { user } = useAuth()
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 transition-colors duration-250 dark:bg-[#171717]">
      <header className="border-b border-emerald-900/50 bg-gradient-to-r from-emerald-950 via-emerald-950 to-emerald-900 text-white shadow-xs transition-colors duration-250 dark:border-[#383838] dark:from-[#1C1C1C] dark:via-[#1C1C1C] dark:to-[#181818]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2.5">
            <Link to={user ? dashboardPath(user.role) : '/login'}
              className="rounded-lg bg-gradient-to-b from-emerald-700 to-emerald-800 px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-[0_1px_2px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-emerald-600/30 transition-all duration-150 hover:from-emerald-600 hover:to-emerald-700 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
              {user ? 'Ke Dashboard' : 'Masuk'}
            </Link>
            <ThemeToggle variant="dark-surface" />
          </div>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-stone-200/80 bg-white/60 transition-colors duration-250 dark:border-[#383838] dark:bg-[#1C1C1C]">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-stone-500 sm:px-6 dark:text-[#A3A3A3]">
          MAPALA Eden Club · Universitas Advent Indonesia
        </div>
      </footer>
    </div>
  )
}
