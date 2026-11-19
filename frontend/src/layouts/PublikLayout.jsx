import { Link, Outlet } from 'react-router-dom'
import Brand from '../components/Brand'
import { dashboardPath, useAuth } from '../context/AuthContext'

export default function PublikLayout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Brand />
          <Link to={user ? dashboardPath(user.role) : '/login'} className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-medium hover:bg-emerald-700">
            {user ? 'Ke Dashboard' : 'Masuk'}
          </Link>
        </div>
      </header>
      <Outlet />
      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-stone-500">
        MAPALA Eden Club · Universitas Advent Indonesia
      </footer>
    </div>
  )
}
