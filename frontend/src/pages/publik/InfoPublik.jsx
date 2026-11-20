import { Badge, EmptyState, Loadable } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { periode } from '../../utils/format'
import { label } from '../../utils/labels'

export default function InfoPublik() {
  const { data: program, loading, error } = useFetch('/publik/program', [])

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="mb-8 border-b border-stone-200 pb-6 dark:border-[#383838]">
        <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">Informasi publik</p>
        <h1 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-stone-900 text-balance sm:text-3xl dark:text-[#F2F2F2]">
          Program Pendidikan MAPALA Eden Club
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed font-normal text-stone-600 dark:text-[#A3A3A3]">
          Program wajib (Inagurasi dan Diklatsar) serta program tambahan seperti arung jeram dan panjat tebing.
          Pendaftaran peserta dilakukan oleh pengurus.
        </p>
      </section>
      <Loadable loading={loading} error={error}>
        {program.length === 0 ? (
          <div className="card"><EmptyState>Belum ada program.</EmptyState></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {program.map((p, i) => (
              <article key={`${p.nama_program}-${i}`} className="card flex flex-col justify-between gap-3 bg-gradient-to-b from-white to-stone-50/40 p-6 transition-all duration-150 hover:border-emerald-600/40 hover:shadow-[0_6px_18px_-4px_rgba(6,78,59,0.08)] dark:from-[#2B2B2B]/65 dark:to-[#242424] dark:hover:border-[#4A4A4A] dark:hover:shadow-[0_6px_18px_-4px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-[#F2F2F2]">{p.nama_program}</h2>
                    <Badge color={p.jenis === 'rutin' ? 'blue' : 'purple'}>{label(p.jenis)}</Badge>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-stone-500 dark:text-[#737373]">{periode(p.tanggal_mulai, p.tanggal_selesai)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-[#A3A3A3]">{p.deskripsi || 'Belum ada deskripsi.'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Loadable>
    </main>
  )
}
