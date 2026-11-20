import { useState } from 'react'
import { Card, EmptyState, Loadable, Modal, PageHeader, ProgressBar, StatusBadge, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatTanggalWaktu } from '../../utils/format'

const TABS = [{ key: 'ringkasan', label: 'Ringkasan per peserta' }, { key: 'absensi', label: 'Detail absensi' }]

export default function Laporan() {
  const [filter, setFilter] = useState({ id_program: '', id_anggota: '' })
  const [tab, setTab] = useState('ringkasan')
  const [detail, setDetail] = useState(null)
  const { data: program } = useFetch('/program', [])
  const { data: anggota } = useFetch('/anggota', [])
  const qs = new URLSearchParams(Object.entries(filter).filter(([, v]) => v)).toString()
  const { data: rekap, loading, error } = useFetch(`/laporan${qs ? `?${qs}` : ''}`, [])

  const set = (k) => (e) => setFilter({ ...filter, [k]: e.target.value })

  const detailRows = rekap.flatMap((r) => r.detail_absensi.map((a, i) => ({ ...a, key: `${r.id_peserta}-${i}`, siswa: r.siswa.nama, program: r.program.nama_program })))

  return (
    <>
      <PageHeader title="Laporan" subtitle="Rekap kehadiran, progres materi, dan hasil evaluasi per siswa." />
      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="f-program" className="label">Program</label>
            <select id="f-program" className="input" value={filter.id_program} onChange={set('id_program')}>
              <option value="">Semua program</option>
              {program.map((p) => <option key={p.id_program} value={p.id_program}>{p.nama_program}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-anggota" className="label">Anggota</label>
            <select id="f-anggota" className="input" value={filter.id_anggota} onChange={set('id_anggota')}>
              <option value="">Semua anggota</option>
              {anggota.map((a) => <option key={a.id_anggota} value={a.id_anggota}>{a.nama}</option>)}
            </select>
          </div>
          <button type="button" className="btn-secondary" onClick={() => setFilter({ id_program: '', id_anggota: '' })} disabled={!qs}>Reset filter</button>
        </div>
      </Card>

      <div className="mb-4 flex gap-1 border-b border-stone-200 dark:border-[#383838]" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${tab === t.key ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-[#F2F2F2]' : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-[#A3A3A3] dark:hover:text-[#F2F2F2]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card bodyClassName="p-0">
        <Loadable loading={loading} error={error}>
          {rekap.length === 0 ? <EmptyState>Tidak ada data peserta untuk filter ini.</EmptyState> : tab === 'ringkasan' ? (
            <TableWrap>
              <table className="table">
                <thead>
                  <tr><th>Siswa</th><th>Program</th><th className="text-center">Hadir</th><th className="text-center">Izin</th><th className="text-center">Sakit</th><th className="text-center">Alpa</th><th className="w-52">Progres materi</th><th className="text-center">Evaluasi</th></tr>
                </thead>
                <tbody>
                  {rekap.map((r) => (
                    <tr key={r.id_peserta} className="cursor-pointer hover:!bg-emerald-50/40 dark:hover:!bg-[#2B2B2B]" onClick={() => setDetail(r)} tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setDetail(r))} aria-label={`Lihat detail ${r.siswa.nama}`}>
                      <td><p className="font-medium text-emerald-800 dark:text-emerald-400">{r.siswa.nama}</p><p className="mt-0.5 font-mono text-xs text-stone-500 tabular-nums dark:text-[#737373]">{r.siswa.nim || '-'}</p></td>
                      <td className="text-stone-800 dark:text-[#F2F2F2]">{r.program.nama_program}</td>
                      <td className="text-center tabular-nums">{r.absensi.hadir}</td>
                      <td className="text-center tabular-nums">{r.absensi.izin}</td>
                      <td className="text-center tabular-nums">{r.absensi.sakit}</td>
                      <td className="text-center tabular-nums">{r.absensi.alpa}</td>
                      <td className="w-52"><ProgressBar value={r.progres.persen} /><p className="mt-1 text-xs text-stone-500 tabular-nums dark:text-[#737373]">{r.progres.diakses} dari {r.progres.total} materi</p></td>
                      <td className="text-center font-medium tabular-nums">{r.evaluasi.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-stone-100 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-500 dark:border-[#383838] dark:bg-[#1C1C1C]/80 dark:text-[#737373]">Klik baris untuk melihat detail progres per materi dan hasil evaluasi.</p>
            </TableWrap>
          ) : detailRows.length === 0 ? <EmptyState>Belum ada data absensi untuk filter ini.</EmptyState> : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>Siswa</th><th>Program</th><th>Tanggal</th><th>Kegiatan</th><th>Status</th><th>Keterangan</th></tr></thead>
                <tbody>
                  {detailRows.map((a) => (
                    <tr key={a.key}>
                      <td className="font-medium text-stone-900 dark:text-[#F2F2F2]">{a.siswa}</td>
                      <td className="text-stone-700 dark:text-[#A3A3A3]">{a.program}</td>
                      <td className="whitespace-nowrap text-stone-700 tabular-nums dark:text-[#A3A3A3]">{formatTanggal(a.tanggal)}</td>
                      <td className="font-medium text-stone-800 dark:text-[#F2F2F2]">{a.kegiatan}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td className="text-stone-600 dark:text-[#A3A3A3]">{a.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Loadable>
      </Card>

      <Modal open={Boolean(detail)} size="xl" title={detail ? `${detail.siswa.nama} — ${detail.program.nama_program}` : ''} onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2.5 text-sm font-semibold text-stone-900 dark:text-[#F2F2F2]">Progres per materi ({detail.progres.persen}%)</h3>
              {detail.detail_progres.length === 0 ? <p className="text-sm text-stone-500 dark:text-[#A3A3A3]">Program belum memiliki materi.</p> : (
                <TableWrap>
                  <table className="table">
                    <thead><tr><th>Materi</th><th>Kategori</th><th>Status</th><th>Diakses</th></tr></thead>
                    <tbody>
                      {detail.detail_progres.map((m) => (
                        <tr key={m.id_materi}><td className="font-medium text-stone-900 dark:text-[#F2F2F2]">{m.judul}</td><td>{m.kategori}</td><td><StatusBadge status={m.status} /></td><td className="whitespace-nowrap">{formatTanggalWaktu(m.tanggal_akses)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </div>
            <div>
              <h3 className="mb-2.5 text-sm font-semibold text-stone-900 dark:text-[#F2F2F2]">Hasil evaluasi</h3>
              {detail.evaluasi.length === 0 ? <p className="text-sm text-stone-500 dark:text-[#A3A3A3]">Belum ada hasil evaluasi.</p> : (
                <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 dark:divide-[#383838]/75 dark:border-[#383838]">
                  {detail.evaluasi.map((ev, i) => (
                    <li key={i} className="p-4 text-sm">
                      <p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{ev.kegiatan} <span className="font-normal text-stone-500 dark:text-[#A3A3A3]">· {formatTanggal(ev.tanggal)}</span></p>
                      <p className="mt-1.5 whitespace-pre-line leading-relaxed text-stone-700 dark:text-[#A3A3A3]">{ev.hasil_penilaian}</p>
                      {ev.catatan && <p className="mt-1.5 text-stone-500 dark:text-[#A3A3A3]">Catatan: {ev.catatan}</p>}
                      <p className="mt-1.5 text-xs text-stone-400 dark:text-[#737373]">Dicatat oleh {ev.pencatat}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
