import { useTheme } from '../context/ThemeContext'

/**
 * Tombol switch Light Mode / Dark Mode di pojok kanan header setiap halaman.
 * Menggunakan ikon Sun & Moon dengan animasi rotasi + transisi halus.
 */
export default function ThemeToggle({ variant = 'surface', className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  const tone = variant === 'dark-surface'
    ? 'border-white/15 bg-white/10 text-emerald-50 hover:border-white/25 hover:bg-white/20 hover:text-white dark:border-[#383838] dark:bg-[#242424]/90 dark:text-[#F2F2F2] dark:hover:border-[#4A4A4A] dark:hover:bg-[#2B2B2B] dark:hover:text-white focus-visible:outline-emerald-300'
    : 'border-stone-200/90 bg-white text-stone-600 shadow-xs hover:border-stone-300 hover:bg-stone-100 hover:text-stone-900 dark:border-[#383838] dark:bg-[#242424] dark:text-[#F2F2F2] dark:hover:border-[#4A4A4A] dark:hover:bg-[#2B2B2B] dark:hover:text-white focus-visible:outline-emerald-600 dark:focus-visible:outline-emerald-500'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
      aria-pressed={isDark}
      title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      className={`inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 ease-out active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:transform-none ${tone} ${className}`}
    >
      <span className="relative size-4" aria-hidden="true">
        {/* Sun icon (tampil saat Light Mode) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 size-4 transition-all duration-300 ease-out motion-reduce:transition-none ${
            isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        {/* Moon icon (tampil saat Dark Mode) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 size-4 transition-all duration-300 ease-out motion-reduce:transition-none ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
          }`}
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
    </button>
  )
}
