import { Navigate } from 'react-router-dom'
import { dashboardPath, useAuth } from '../context/AuthContext'

/** /dashboard → dashboard sesuai role. */
export default function RoleRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? dashboardPath(user.role) : '/login'} replace />
}
