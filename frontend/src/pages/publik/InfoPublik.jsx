import { Badge, EmptyState, Loadable } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { periode } from '../../utils/format'
import { label } from '../../utils/labels'

export default function InfoPublik() {
  const { data: program, loading, error } = useFetch('/publik/program', [])

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8">
        <p className="text-sm font-medium text-emerald-700">Informasi publik</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">Program Pendidikan MAPALA Eden Club</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Program wajib (Inagurasi dan Diklatsar) serta program tambahan seperti arung jeram dan panjat tebing.
          Pendaftaran peserta dilakukan oleh pengurus.
        </p>
      </section>
      <Loadable loading={loading} error={error}>
        {program.length === 0 ? (
          <div className="card"><EmptyState>Belum ada program.</EmptyState></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {program.map((p, i) => (
              <article key={`${p.nama_program}-${i}`} className="card flex flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-stone-900">{p.nama_program}</h2>
                  <Badge color={p.jenis === 'rutin' ? 'blue' : 'purple'}>{label(p.jenis)}</Badge>
                </div>
                <p className="text-sm text-stone-500">{periode(p.tanggal_mulai, p.tanggal_selesai)}</p>
                <p className="text-sm text-stone-700">{p.deskripsi || 'Belum ada deskripsi.'}</p>
              </article>
            ))}
          </div>
        )}
      </Loadable>
    </main>
  )
}
