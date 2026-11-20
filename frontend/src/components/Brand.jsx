export default function Brand({
  className = "",
  subtitle = "Sistem Pendidikan · UNAI",
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/logo_eden.png" alt="" className="size-8 rounded-lg" />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold tracking-tight">
          MAPALA Eden Club
        </p>
        <p className="truncate text-xs font-medium opacity-75">{subtitle}</p>
      </div>
    </div>
  );
}
