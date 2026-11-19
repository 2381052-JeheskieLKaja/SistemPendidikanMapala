import { useEffect, useId } from 'react'
import { label } from '../utils/labels'

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, actions, children, className = '', bodyClassName = 'p-4' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 px-4 py-3">
          <h2 className="font-semibold text-stone-800">{title}</h2>
          {actions}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value, hint, accent = 'emerald' }) {
  const colors = {
    emerald: 'text-emerald-700',
    sky: 'text-sky-700',
    amber: 'text-amber-700',
    stone: 'text-stone-700',
  }
  return (
    <div className="card p-4">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${colors[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  )
}

export function Alert({ type = 'error', children, onClose, className = '' }) {
  if (!children) return null
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }
  if (!styles[type]) return null
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${styles[type]} ${className}`}>
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Tutup">
          ✕
        </button>
      )}
    </div>
  )
}

const BADGE_COLORS = {
  green: 'bg-emerald-100 text-emerald-800',
  blue: 'bg-sky-100 text-sky-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-stone-100 text-stone-700',
  purple: 'bg-violet-100 text-violet-800',
}

export function Badge({ color = 'gray', children }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_COLORS[color]}`}>{children}</span>
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
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="w-12 text-right text-xs font-medium text-stone-600 tabular-nums">{pct}%</span>}
    </div>
  )
}

export function Spinner({ label = 'Memuat...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-stone-500">
      <span className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-600" />
      {label}
    </div>
  )
}

export function EmptyState({ children = 'Belum ada data.', action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-8 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17l5-9 4 6 3-4 6 7H3z" strokeLinejoin="round" />
      </svg>
      <p className="max-w-sm text-sm text-stone-500">{children}</p>
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
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
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
      {label && <label htmlFor={inputId} className="label">{label}{props.required && <span className="text-red-600"> *</span>}</label>}
      <input id={inputId} className={`input ${error ? 'input-error' : ''}`} aria-invalid={Boolean(error)} {...props} />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  )
}

export function Select({ label, error, options, placeholder, className = '', id, ...props }) {
  const inputId = useFieldId(id)
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}{props.required && <span className="text-red-600"> *</span>}</label>}
      <select id={inputId} className={`input ${error ? 'input-error' : ''}`} aria-invalid={Boolean(error)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', id, ...props }) {
  const inputId = useFieldId(id)
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <textarea id={inputId} rows={3} className={`input ${error ? 'input-error' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`card my-8 w-full ${widths[size]}`}>
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
          <h2 className="font-semibold text-stone-900">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-sm" aria-label="Tutup">✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}
