export default function Brand({ className = '', subtitle = 'Sistem Pendidikan · UNAI' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src="/favicon.svg" alt="" className="size-8" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">MAPALA Eden Club</p>
        <p className="text-xs opacity-70">{subtitle}</p>
      </div>
    </div>
  )
}
