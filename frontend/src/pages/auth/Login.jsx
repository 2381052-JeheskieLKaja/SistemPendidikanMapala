import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '../../api/axios'
import Brand from '../../components/Brand'
import { Alert, Input } from '../../components/ui'
import { dashboardPath, useAuth } from '../../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={dashboardPath(user.role)} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email.trim() || !form.password) return setError('Email dan password wajib diisi')
    setError('')
    setLoading(true)
    try {
      const u = await login(form.email.trim(), form.password)
      const from = location.state?.from
      navigate(from?.startsWith(`/${u.role}/`) ? from : dashboardPath(u.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Login gagal'))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 p-4">
      <div className="w-full max-w-sm">
        <Brand className="mb-6 justify-center text-white" />
        <form onSubmit={handleSubmit} className="card space-y-4 p-6" noValidate>
          <div>
            <h1 className="text-lg font-semibold text-stone-900">Masuk</h1>
            <p className="text-sm text-stone-500">Gunakan akun yang dibuat oleh Admin.</p>
          </div>
          {params.get('sesi') === 'habis' && !error && <Alert type="warning">Sesi Anda berakhir, silakan login kembali.</Alert>}
          <Alert>{error}</Alert>
          <Input label="Email" type="email" autoComplete="email" required autoFocus
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" autoComplete="current-password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</button>
          <p className="text-center text-sm">
            <Link to="/publik" className="text-emerald-700 hover:underline">Lihat informasi program (tanpa login)</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
