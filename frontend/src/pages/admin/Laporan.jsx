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

      <div className="mb-4 flex gap-1 border-b border-stone-200" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t.key ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-800'}`}>
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
                  <tr><th>Siswa</th><th>Program</th><th className="text-center">Hadir</th><th className="text-center">Izin</th><th className="text-center">Sakit</th><th className="text-center">Alpa</th><th className="min-w-40">Progres materi</th><th className="text-center">Evaluasi</th></tr>
                </thead>
                <tbody>
                  {rekap.map((r) => (
                    <tr key={r.id_peserta} className="cursor-pointer" onClick={() => setDetail(r)} tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setDetail(r))} aria-label={`Lihat detail ${r.siswa.nama}`}>
                      <td><p className="font-medium text-emerald-800">{r.siswa.nama}</p><p className="text-xs text-stone-500">{r.siswa.nim || '-'}</p></td>
                      <td>{r.program.nama_program}</td>
                      <td className="text-center tabular-nums">{r.absensi.hadir}</td>
                      <td className="text-center tabular-nums">{r.absensi.izin}</td>
                      <td className="text-center tabular-nums">{r.absensi.sakit}</td>
                      <td className="text-center tabular-nums">{r.absensi.alpa}</td>
                      <td><ProgressBar value={r.progres.persen} /><p className="text-xs text-stone-500">{r.progres.diakses} dari {r.progres.total} materi</p></td>
                      <td className="text-center tabular-nums">{r.evaluasi.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-2 text-xs text-stone-500">Klik baris untuk melihat detail progres per materi dan hasil evaluasi.</p>
            </TableWrap>
          ) : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>Siswa</th><th>Program</th><th>Tanggal</th><th>Kegiatan</th><th>Status</th><th>Keterangan</th></tr></thead>
                <tbody>
                  {rekap.flatMap((r) => r.detail_absensi.map((a, i) => (
                    <tr key={`${r.id_peserta}-${i}`}>
                      <td className="font-medium">{r.siswa.nama}</td>
                      <td>{r.program.nama_program}</td>
                      <td className="whitespace-nowrap">{formatTanggal(a.tanggal)}</td>
                      <td>{a.kegiatan}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>{a.keterangan || '-'}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
              {rekap.every((r) => r.detail_absensi.length === 0) && <EmptyState>Belum ada data absensi untuk filter ini.</EmptyState>}
            </TableWrap>
          )}
        </Loadable>
      </Card>

      <Modal open={Boolean(detail)} size="xl" title={detail ? `${detail.siswa.nama} — ${detail.program.nama_program}` : ''} onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-stone-800">Progres per materi ({detail.progres.persen}%)</h3>
              {detail.detail_progres.length === 0 ? <p className="text-sm text-stone-500">Program belum memiliki materi.</p> : (
                <TableWrap>
                  <table className="table">
                    <thead><tr><th>Materi</th><th>Kategori</th><th>Status</th><th>Diakses</th></tr></thead>
                    <tbody>
                      {detail.detail_progres.map((m) => (
                        <tr key={m.id_materi}><td>{m.judul}</td><td>{m.kategori}</td><td><StatusBadge status={m.status} /></td><td>{formatTanggalWaktu(m.tanggal_akses)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-stone-800">Hasil evaluasi</h3>
              {detail.evaluasi.length === 0 ? <p className="text-sm text-stone-500">Belum ada hasil evaluasi.</p> : (
                <ul className="space-y-2">
                  {detail.evaluasi.map((ev, i) => (
                    <li key={i} className="rounded-lg border border-stone-200 p-3 text-sm">
                      <p className="font-medium">{ev.kegiatan} <span className="font-normal text-stone-500">· {formatTanggal(ev.tanggal)}</span></p>
                      <p className="mt-1 whitespace-pre-line text-stone-700">{ev.hasil_penilaian}</p>
                      {ev.catatan && <p className="mt-1 text-stone-500">Catatan: {ev.catatan}</p>}
                      <p className="mt-1 text-xs text-stone-400">Dicatat oleh {ev.pencatat}</p>
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
