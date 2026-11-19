import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AksesDitolak from '../pages/AksesDitolak'

/** Cek token dan role. Guard FE hanya kenyamanan UI; keamanan sebenarnya di backend. */
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <AksesDitolak />
  return <Outlet />
}
