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
        className="relative flex size-9 cursor-pointer items-center justify-center rounded-lg text-stone-600 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-[#A3A3A3] dark:hover:bg-[#2B2B2B] dark:hover:text-[#F2F2F2] dark:focus-visible:outline-emerald-500"
        aria-expanded={open}
        aria-label={`Notifikasi, ${data.belum_dibaca} belum dibaca`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {data.belum_dibaca > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white tabular-nums ring-2 ring-white dark:ring-[#1C1C1C]">
            {data.belum_dibaca > 99 ? '99+' : data.belum_dibaca}
          </span>
        )}
      </button>
      {open && (
        <div className="card absolute right-0 z-40 mt-2 w-[min(23rem,calc(100vw-2rem))] overflow-hidden shadow-[0_14px_34px_-8px_rgba(28,25,23,0.18)] ring-1 ring-stone-950/5 dark:shadow-[0_18px_40px_-8px_rgba(0,0,0,0.65)] dark:ring-[#383838]">
          <div className="flex items-center justify-between border-b border-stone-200/70 bg-gradient-to-b from-stone-50/80 to-white px-4 py-3 dark:border-[#383838] dark:from-[#2B2B2B] dark:to-[#242424]">
            <p className="text-sm font-semibold tracking-tight text-stone-900 dark:text-[#F2F2F2]">Notifikasi</p>
            <span className="text-xs text-stone-500 tabular-nums dark:text-[#A3A3A3]">{data.belum_dibaca} belum dibaca</span>
          </div>
          <ul className="max-h-96 divide-y divide-stone-100 overflow-y-auto dark:divide-[#383838]/75">
            {loading && data.items.length === 0 && <li className="px-4 py-8 text-center text-sm text-stone-500 dark:text-[#A3A3A3]">Memuat...</li>}
            {!loading && data.items.length === 0 && <li className="px-4 py-8 text-center text-sm text-stone-500 dark:text-[#A3A3A3]">Belum ada notifikasi.</li>}
            {data.items.map((n) => (
              <li key={n.id_notifikasi}>
                <button type="button" onClick={() => bukaNotifikasi(n)}
                  className={`flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-[#2B2B2B] ${n.status_baca ? '' : 'bg-emerald-50/50 dark:bg-[#2B2B2B]/70'}`}>
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.status_baca ? 'bg-transparent' : 'bg-emerald-600 dark:bg-emerald-400'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm leading-snug ${n.status_baca ? 'text-stone-600 dark:text-[#A3A3A3]' : 'font-medium text-stone-900 dark:text-[#F2F2F2]'}`}>{n.pesan}</span>
                    <span className="mt-0.5 block text-xs text-stone-500 dark:text-[#737373]">{n.kategori} · {formatTanggalWaktu(n.created_at)}</span>
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
