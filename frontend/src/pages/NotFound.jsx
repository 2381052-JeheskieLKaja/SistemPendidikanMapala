import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-semibold text-emerald-800">404</p>
      <p className="text-stone-600">Halaman tidak ditemukan.</p>
      <Link to="/dashboard" className="btn-primary">Kembali</Link>
    </div>
  )
}
