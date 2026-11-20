import { useEffect, useId } from 'react'
import { label } from '../utils/labels'

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl leading-tight font-bold tracking-tight text-stone-900 text-balance transition-colors duration-250 dark:text-[#F2F2F2] sm:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed font-normal text-stone-500 transition-colors duration-250 dark:text-[#A3A3A3]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, actions, children, className = '', bodyClassName = 'p-5', titleAs: TitleTag = 'h2' }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-stone-200/70 bg-gradient-to-b from-stone-50/70 to-white px-5 py-3.5 transition-colors duration-250 dark:border-[#383838] dark:from-[#2B2B2B] dark:to-[#242424]">
          <TitleTag className="text-[15px] leading-snug font-semibold tracking-tight text-stone-900 dark:text-[#F2F2F2]">{title}</TitleTag>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value, hint, accent = 'emerald' }) {
  const styles = {
    emerald: {
      text: 'text-emerald-700 dark:text-emerald-400',
      wash: 'from-emerald-50/45 via-white to-white dark:from-[#2B2B2B] dark:via-[#242424] dark:to-[#242424]',
    },
    sky: {
      text: 'text-sky-700 dark:text-[#F2F2F2]',
      wash: 'from-sky-50/45 via-white to-white dark:from-[#2B2B2B] dark:via-[#242424] dark:to-[#242424]',
    },
    amber: {
      text: 'text-amber-700 dark:text-amber-400',
      wash: 'from-amber-50/45 via-white to-white dark:from-[#2B2B2B] dark:via-[#242424] dark:to-[#242424]',
    },
    stone: {
      text: 'text-stone-700 dark:text-[#A3A3A3]',
      wash: 'from-stone-50/70 via-white to-white dark:from-[#2B2B2B] dark:via-[#242424] dark:to-[#242424]',
    },
  }
  const s = styles[accent] || styles.emerald
  return (
    <div className={`card flex flex-col justify-between bg-gradient-to-b p-5 transition-all duration-200 hover:border-stone-300/90 hover:shadow-[0_4px_12px_-2px_rgba(28,25,23,0.06)] dark:hover:border-[#4A4A4A] dark:hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45)] ${s.wash}`}>
      <div>
        <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-[#A3A3A3]">{label}</p>
        <p className={`mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${s.text}`}>{value}</p>
      </div>
      {hint && <p className="mt-2 text-xs font-normal text-stone-500 dark:text-[#737373]">{hint}</p>}
    </div>
  )
}

export function Alert({ type = 'error', children, onClose, className = '' }) {
  if (!children) return null
  const styles = {
    error: 'border-red-200 bg-red-50/90 text-red-800 dark:border-red-900/55 dark:bg-red-950/35 dark:text-red-200',
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800/55 dark:bg-emerald-950/35 dark:text-emerald-200',
    info: 'border-sky-200 bg-sky-50/90 text-sky-900 dark:border-[#383838] dark:bg-[#2B2B2B] dark:text-[#F2F2F2]',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-800/55 dark:bg-amber-950/30 dark:text-amber-200',
  }
  if (!styles[type]) return null
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed transition-colors duration-200 ${styles[type]} ${className}`}>
      <span className="min-w-0 flex-1">{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100" aria-label="Tutup">
          ✕
        </button>
      )}
    </div>
  )
}

const BADGE_COLORS = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/45 dark:text-emerald-300 dark:ring-emerald-700/45',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-[#2B2B2B] dark:text-[#F2F2F2] dark:ring-[#383838]',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-[#2B2B2B] dark:text-amber-300 dark:ring-amber-700/40',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-[#2B2B2B] dark:text-red-300 dark:ring-red-800/45',
  gray: 'bg-stone-100 text-stone-600 ring-stone-500/15 dark:bg-[#2B2B2B] dark:text-[#A3A3A3] dark:ring-[#383838]',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-[#2B2B2B] dark:text-[#D4D4D4] dark:ring-[#4A4A4A]',
}

export function Badge({ color = 'gray', children }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset transition-colors duration-200 ${BADGE_COLORS[color]}`}>
      {children}
    </span>
  )
}

const STATUS_COLOR = {
  aktif: 'green', nonaktif: 'red', selesai: 'blue',
  hadir: 'green', izin: 'blue', sakit: 'yellow', alpa: 'red',
  draft: 'gray', diresmikan: 'green',
  rutin: 'blue', tambahan: 'purple',
  sudah_diakses: 'green', belum_diakses: 'gray',
  calon_siswa: 'gray', siswa: 'yellow', calon_anggota: 'blue', anggota: 'green', ppa: 'purple', dp: 'purple', pemburu_tua: 'purple',
  admin: 'red', pengurus: 'blue',
}

export function StatusBadge({ status, empty = 'Belum diisi' }) {
  if (!status) return <Badge>{empty}</Badge>
  return <Badge color={STATUS_COLOR[status] || 'gray'}>{label(status)}</Badge>
}

export function ProgressBar({ value, showLabel = true }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200/80 shadow-inner dark:bg-[#171717]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-all duration-300 ease-out dark:from-emerald-600 dark:to-emerald-400" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="w-10 text-right text-xs font-semibold text-stone-700 tabular-nums dark:text-[#F2F2F2]">{pct}%</span>}
    </div>
  )
}

export function Spinner({ label = 'Memuat...' }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-12 text-sm text-stone-500 dark:text-[#A3A3A3]">
      <span className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700 dark:border-[#383838] dark:border-t-emerald-400" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ children = 'Belum ada data.', action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-[#2B2B2B] dark:text-[#737373]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 17l5-9 4 6 3-4 6 7H3z" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-stone-500 dark:text-[#A3A3A3]">{children}</p>
      {action}
    </div>
  )
}

/** Bungkus tabel agar bisa di-scroll horizontal di layar kecil. */
export function TableWrap({ children }) {
  return <div className="overflow-x-auto">{children}</div>
}

/** Tampilkan spinner / error / konten sesuai state fetch. */
export function Loadable({ loading, error, children }) {
  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  return children
}

export function Field({ label, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && <span className="label">{label}</span>}
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p> : hint && <p className="mt-1.5 text-xs text-stone-500 dark:text-[#737373]">{hint}</p>}
    </div>
  )
}

function useFieldId(id) {
  const generated = useId()
  return id || generated
}

export function Input({ label, error, hint, className = '', id, ...props }) {
  const inputId = useFieldId(id)
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}{props.required && <span className="text-red-600 dark:text-red-400"> *</span>}</label>}
      <input id={inputId} className={`input ${error ? 'input-error' : ''}`} aria-invalid={Boolean(error)} {...props} />
      {error ? <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p> : hint && <p className="mt-1.5 text-xs text-stone-500 dark:text-[#737373]">{hint}</p>}
    </div>
  )
}

export function Select({ label, error, options, placeholder, className = '', id, ...props }) {
  const inputId = useFieldId(id)
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}{props.required && <span className="text-red-600 dark:text-red-400"> *</span>}</label>}
      <select id={inputId} className={`input ${error ? 'input-error' : ''}`} aria-invalid={Boolean(error)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', id, ...props }) {
  const inputId = useFieldId(id)
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <textarea id={inputId} rows={3} className={`input ${error ? 'input-error' : ''}`} {...props} />
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 backdrop-blur-[2px] dark:bg-black/75 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`card my-8 w-full overflow-hidden shadow-[0_24px_48px_-12px_rgba(28,25,23,0.22)] ring-1 ring-stone-950/5 dark:shadow-[0_24px_56px_-12px_rgba(0,0,0,0.75)] dark:ring-[#383838] ${widths[size]}`}>
        <div className="flex items-center justify-between gap-3 border-b border-stone-200/70 bg-gradient-to-b from-stone-50/70 to-white px-6 py-4 dark:border-[#383838] dark:from-[#2B2B2B] dark:to-[#242424]">
          <h2 className="text-lg leading-snug font-semibold tracking-tight text-stone-900 dark:text-[#F2F2F2]">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-sm -mr-1.5" aria-label="Tutup">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-stone-200/70 bg-stone-50/75 px-6 py-3.5 dark:border-[#383838] dark:bg-[#1C1C1C]/90">{footer}</div>}
      </div>
    </div>
  )
}
