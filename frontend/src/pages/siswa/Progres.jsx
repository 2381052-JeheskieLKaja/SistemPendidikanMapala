import { Card, EmptyState, Loadable, PageHeader, ProgressBar, StatusBadge, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatTanggalWaktu } from '../../utils/format'
import BelumTerdaftar from './BelumTerdaftar'

export default function Progres() {
  const { data, loading, error } = useFetch('/progres/saya')

  return (
    <>
      <PageHeader title="Progres & Hasil Evaluasi" subtitle="Persentase materi yang sudah dibuka dan catatan penilaian dari pengurus." />
      <Loadable loading={loading} error={error}>
        {data && (data.per_program.length === 0 ? <BelumTerdaftar /> : (
          <div className="space-y-6">
            {data.per_program.map((p) => (
              <Card key={p.id_program} title={p.nama_program} bodyClassName="p-0">
                <div className="border-b border-stone-100 px-5 py-4 dark:border-[#383838]/75">
                  <ProgressBar value={p.persen} />
                  <p className="mt-1.5 text-sm text-stone-600 tabular-nums dark:text-[#A3A3A3]">{p.diakses} dari {p.total_materi} materi sudah dibuka</p>
                </div>
                {p.materi.length === 0 ? <p className="p-5 text-sm text-stone-500 dark:text-[#A3A3A3]">Program ini belum memiliki materi.</p> : (
                  <TableWrap>
                    <table className="table">
                      <thead><tr><th>Materi</th><th>Kategori</th><th>Status</th><th>Dibuka</th></tr></thead>
                      <tbody>
                        {p.materi.map((m) => (
                          <tr key={m.id_materi}><td className="font-medium text-stone-900 dark:text-[#F2F2F2]">{m.judul}</td><td>{m.kategori}</td><td><StatusBadge status={m.status} /></td><td className="whitespace-nowrap">{formatTanggalWaktu(m.tanggal_akses)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </TableWrap>
                )}
              </Card>
            ))}

            <Card title="Hasil evaluasi" bodyClassName="p-0">
              {data.evaluasi.length === 0 ? <EmptyState>Belum ada hasil evaluasi.</EmptyState> : (
                <ul className="divide-y divide-stone-100 dark:divide-[#383838]/75">
                  {data.evaluasi.map((e) => (
                    <li key={e.id_evaluasi} className="px-5 py-4 text-sm">
                      <p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{e.kegiatan}</p>
                      <p className="mt-0.5 text-xs text-stone-500 dark:text-[#A3A3A3]">{e.nama_program} · {formatTanggal(e.tanggal)}</p>
                      <p className="mt-2 whitespace-pre-line leading-relaxed text-stone-700 dark:text-[#A3A3A3]">{e.hasil_penilaian}</p>
                      {e.catatan && <p className="mt-1.5 text-stone-500 dark:text-[#A3A3A3]">Catatan: {e.catatan}</p>}
                      <p className="mt-1.5 text-xs text-stone-400 dark:text-[#737373]">Dicatat oleh {e.pencatat}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        ))}
      </Loadable>
    </>
  )
}
