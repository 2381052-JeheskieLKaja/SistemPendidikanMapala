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
              <Card key={p.id_program} title={p.nama_program}>
                <div className="mb-4">
                  <ProgressBar value={p.persen} />
                  <p className="mt-1 text-sm text-stone-600">{p.diakses} dari {p.total_materi} materi sudah dibuka</p>
                </div>
                {p.materi.length === 0 ? <p className="text-sm text-stone-500">Program ini belum memiliki materi.</p> : (
                  <TableWrap>
                    <table className="table">
                      <thead><tr><th>Materi</th><th>Kategori</th><th>Status</th><th>Dibuka</th></tr></thead>
                      <tbody>
                        {p.materi.map((m) => (
                          <tr key={m.id_materi}><td>{m.judul}</td><td>{m.kategori}</td><td><StatusBadge status={m.status} /></td><td>{formatTanggalWaktu(m.tanggal_akses)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </TableWrap>
                )}
              </Card>
            ))}

            <Card title="Hasil evaluasi">
              {data.evaluasi.length === 0 ? <EmptyState>Belum ada hasil evaluasi.</EmptyState> : (
                <ul className="space-y-3">
                  {data.evaluasi.map((e) => (
                    <li key={e.id_evaluasi} className="rounded-lg border border-stone-200 p-3 text-sm">
                      <p className="font-medium text-stone-900">{e.kegiatan}</p>
                      <p className="text-xs text-stone-500">{e.nama_program} · {formatTanggal(e.tanggal)}</p>
                      <p className="mt-2 whitespace-pre-line text-stone-700">{e.hasil_penilaian}</p>
                      {e.catatan && <p className="mt-1 text-stone-500">Catatan: {e.catatan}</p>}
                      <p className="mt-1 text-xs text-stone-400">Dicatat oleh {e.pencatat}</p>
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
