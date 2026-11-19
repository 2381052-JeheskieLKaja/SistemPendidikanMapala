import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

const STYLES = {
  success: 'border-emerald-200 bg-white text-emerald-800 [&>span:first-child]:bg-emerald-600',
  error: 'border-red-200 bg-white text-red-800 [&>span:first-child]:bg-red-600',
  info: 'border-sky-200 bg-white text-sky-800 [&>span:first-child]:bg-sky-600',
}

/** Notifikasi singkat (feedback setelah aksi). Pakai: const notify = useToast(); notify('success', 'Tersimpan'). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const seq = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback((type, text) => {
    const id = ++seq.current
    setToasts((t) => [...t.slice(-3), { id, type, text }])
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000)
  }, [dismiss])

  const value = useMemo(() => notify, [notify])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
        {toasts.map((t) => (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-3 py-2.5 text-sm shadow-lg ${STYLES[t.type] || STYLES.info}`}>
            <span className="mt-1.5 size-2 shrink-0 rounded-full" aria-hidden="true" />
            <span className="flex-1">{t.text}</span>
            <button type="button" onClick={() => dismiss(t.id)} className="text-stone-400 hover:text-stone-700" aria-label="Tutup notifikasi">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
