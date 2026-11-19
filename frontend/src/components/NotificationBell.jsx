import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api/axios'
import { formatTanggalWaktu } from '../utils/format'
import { useToast } from './Toast'

/** Lonceng notifikasi materi baru (khusus Siswa). */
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState({ belum_dibaca: 0, items: [] })
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const notify = useToast()

  async function load() {
    setLoading(true)
    try {
      setData((await api.get('/notifikasi')).data.data)
    } catch {
      /* lonceng tetap tampil tanpa angka bila gagal */
    } finally {
      setLoading(false)
    }
  }

  // Muat ulang saat berpindah halaman (mis. setelah membuka materi) dan berkala tiap 60 detik.
  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  async function bukaNotifikasi(n) {
    try {
      if (!n.status_baca) await api.put(`/notifikasi/${n.id_notifikasi}/dibaca`)
      setOpen(false)
      navigate(`/siswa/materi?materi=${n.id_materi}`)
      load()
    } catch (err) {
      notify('error', errorMessage(err))
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button" onClick={() => { setOpen((v) => !v); if (!open) load() }}
        className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-expanded={open}
        aria-label={`Notifikasi, ${data.belum_dibaca} belum dibaca`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {data.belum_dibaca > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white tabular-nums">
            {data.belum_dibaca > 99 ? '99+' : data.belum_dibaca}
          </span>
        )}
      </button>
      {open && (
        <div className="card absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2.5">
            <p className="text-sm font-semibold">Notifikasi</p>
            <span className="text-xs text-stone-500">{data.belum_dibaca} belum dibaca</span>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {loading && data.items.length === 0 && <li className="px-4 py-6 text-center text-sm text-stone-500">Memuat...</li>}
            {!loading && data.items.length === 0 && <li className="px-4 py-6 text-center text-sm text-stone-500">Belum ada notifikasi.</li>}
            {data.items.map((n) => (
              <li key={n.id_notifikasi}>
                <button type="button" onClick={() => bukaNotifikasi(n)}
                  className={`flex w-full gap-3 border-b border-stone-50 px-4 py-3 text-left hover:bg-stone-50 ${n.status_baca ? '' : 'bg-emerald-50/60'}`}>
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.status_baca ? 'bg-transparent' : 'bg-emerald-600'}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className={`block text-sm ${n.status_baca ? 'text-stone-600' : 'font-medium text-stone-900'}`}>{n.pesan}</span>
                    <span className="block text-xs text-stone-500">{n.kategori} · {formatTanggalWaktu(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
