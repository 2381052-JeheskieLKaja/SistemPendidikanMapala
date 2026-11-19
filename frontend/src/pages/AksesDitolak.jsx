import { Link } from 'react-router-dom'
import { dashboardPath, useAuth } from '../context/AuthContext'
import { label } from '../utils/labels'

/** Ditampilkan bila role membuka halaman milik aktor lain (mis. Siswa membuka /admin/anggota, TC-21). */
export default function AksesDitolak() {
  const { user } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50 p-6 text-center" role="alert">
      <p className="text-5xl font-semibold text-red-700">403</p>
      <h1 className="text-lg font-semibold text-stone-900">Akses ditolak</h1>
      <p className="max-w-md text-sm text-stone-600">
        Anda tidak memiliki hak akses ke halaman ini. Halaman ini bukan untuk peran {label(user.role)}.
      </p>
      <Link to={dashboardPath(user.role)} className="btn-primary">Kembali ke dashboard saya</Link>
    </div>
  )
}
