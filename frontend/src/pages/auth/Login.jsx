import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '../../api/axios'
import mountainBg from '../../assets/images/login_mountain_bg_1795127313273.jpg'
import Brand from '../../components/Brand'
import ThemeToggle from '../../components/ThemeToggle'
import { Alert, Badge, Input } from '../../components/ui'
import { dashboardPath, useAuth } from '../../context/AuthContext'
import useFetch from '../../hooks/useFetch'
import { periode } from '../../utils/format'
import { label } from '../../utils/labels'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { data: programs, loading: loadingPrograms } = useFetch('/publik/program', [])

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

  const featuredPrograms = programs.slice(0, 3)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <img
          src={mountainBg}
          alt=""
          className="h-full w-full scale-110 object-cover object-center blur-[12px] brightness-[0.82] saturate-[0.95] transition-[filter] duration-300 dark:brightness-[0.58] dark:saturate-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/65 via-emerald-950/45 to-stone-950/75 transition-colors duration-300 dark:from-black/75 dark:via-[#171717]/65 dark:to-black/85" />
      </div>

      <ThemeToggle variant="dark-surface" className="fixed top-4 right-4 z-20 sm:top-5 sm:right-6" />

      <div className="relative z-10 w-full max-w-[900px]">
        <Brand className="mb-6 justify-center text-white drop-shadow-xs" />

        <div className="card grid overflow-hidden border-white/25 bg-white/95 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-sm md:grid-cols-[1.08fr_0.92fr] dark:border-[#383838] dark:bg-[#242424]/95">
          {/* Panel utama: Form Login */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center space-y-5 bg-white/98 p-7 transition-colors duration-250 sm:p-9 dark:bg-[#242424]/95"
            noValidate
          >
            <div>
              <h1 className="text-2xl leading-tight font-bold tracking-tight text-stone-900 dark:text-[#F2F2F2]">Masuk</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-[#A3A3A3]">Gunakan akun yang dibuat oleh Admin.</p>
            </div>
            {params.get('sesi') === 'habis' && !error && <Alert type="warning" className="mb-0">Sesi Anda berakhir, silakan login kembali.</Alert>}
            <Alert className="mb-0">{error}</Alert>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="nama@mapala.test"
                required
                autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Panel pendamping: Informasi Program & Akses Tanpa Login */}
          <aside className="flex flex-col justify-between gap-6 border-t border-stone-200/80 bg-stone-50/95 p-7 transition-colors duration-250 sm:p-8 md:border-t-0 md:border-l dark:border-[#383838] dark:bg-[#1C1C1C]/95">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                  Informasi Program
                </p>
                <h2 className="mt-1.5 text-lg leading-snug font-semibold tracking-tight text-stone-900 dark:text-[#F2F2F2]">
                  Pendidikan MAPALA Eden Club
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-[#A3A3A3]">
                  Program wajib (Inagurasi dan Diklatsar) serta program tambahan seperti arung jeram dan panjat tebing.
                </p>
              </div>

              {loadingPrograms ? (
                <div className="space-y-2.5 rounded-xl border border-stone-200/80 bg-white/80 p-3.5 dark:border-[#383838] dark:bg-[#242424]" aria-hidden="true">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-[#2B2B2B]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100 dark:bg-[#2B2B2B]/70" />
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-stone-200 pt-1 dark:bg-[#2B2B2B]" />
                </div>
              ) : featuredPrograms.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-stone-200/85 bg-white/85 shadow-2xs dark:border-[#383838] dark:bg-[#242424]">
                  <ul className="divide-y divide-stone-200/75 dark:divide-[#383838]">
                    {featuredPrograms.map((p, idx) => (
                      <li key={`${p.nama_program}-${idx}`} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-stone-900 dark:text-[#F2F2F2]">{p.nama_program}</p>
                          <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-[#A3A3A3]">
                            {periode(p.tanggal_mulai, p.tanggal_selesai)}
                          </p>
                        </div>
                        <Badge color={p.jenis === 'rutin' ? 'blue' : 'purple'}>{label(p.jenis)}</Badge>
                      </li>
                    ))}
                  </ul>
                  {programs.length > 3 && (
                    <p className="border-t border-stone-200/75 bg-stone-50/70 px-3.5 py-2 text-xs text-stone-500 dark:border-[#383838] dark:bg-[#2B2B2B] dark:text-[#A3A3A3]">
                      +{programs.length - 3} program pendidikan lainnya tersedia
                    </p>
                  )}
                </div>
              ) : (
                <p className="rounded-xl border border-stone-200/80 bg-white/80 px-3.5 py-3 text-xs leading-relaxed text-stone-600 dark:border-[#383838] dark:bg-[#242424] dark:text-[#A3A3A3]">
                  Jadwal, periode kegiatan, dan deskripsi program pendidikan dapat dilihat secara terbuka melalui halaman informasi publik.
                </p>
              )}
            </div>

            <div className="border-t border-stone-200/80 pt-4 dark:border-[#383838]">
              <p className="text-xs leading-relaxed text-stone-500 dark:text-[#A3A3A3]">
                Ingin melihat informasi program secara lengkap tanpa masuk?
              </p>
              <Link to="/publik" className="btn-secondary mt-2.5 w-full justify-between">
                <span>Lihat informasi program (tanpa login)</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
