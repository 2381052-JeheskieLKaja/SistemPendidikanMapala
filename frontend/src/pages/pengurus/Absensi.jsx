import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../../api/axios'
import { useToast } from '../../components/Toast'
import { Alert, Card, EmptyState, Loadable, StatCard, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { STATUS_ABSENSI, label } from '../../utils/labels'
import JadwalPicker from './JadwalPicker'

const WARNA = { hadir: 'peer-checked:bg-emerald-600', izin: 'peer-checked:bg-sky-600', sakit: 'peer-checked:bg-amber-500', alpa: 'peer-checked:bg-red-600' }

export default function Absensi() {
  const { program } = useOutletContext()
  const notify = useToast()
  const [params, setParams] = useSearchParams()
  const idJadwal = params.get('jadwal') || ''
  const { data, loading, error } = useFetch(idJadwal ? `/absensi?id_jadwal=${idJadwal}` : null)
  const [rows, setRows] = useState([])
  const [rekap, setRekap] = useState(null)
  const [pesan, setPesan] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!data) return
    setRows(data.peserta.map((p) => ({ ...p, keterangan: p.keterangan || '' })))
    setRekap(data.peserta.some((p) => p.status) ? data.rekap : null)
    setPesan('')
  }, [data])

  const setRow = (i, patch) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  async function simpan(e) {
    e.preventDefault()
    if (rows.some((r) => !r.status)) return setPesan('Semua siswa wajib diberi status kehadiran')
    setSaving(true)
    setPesan('')
    try {
      const res = await api.post('/absensi', {
        id_jadwal: Number(idJadwal),
        data: rows.map((r) => ({ id_peserta: r.id_peserta, status: r.status, keterangan: r.keterangan })),
      })
      setRekap(res.data.data.rekap)
      setRows(res.data.data.peserta.map((p) => ({ ...p, keterangan: p.keterangan || '' })))
      notify('success', 'Absensi berhasil disimpan')
    } catch (err) {
      setPesan(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <JadwalPicker idProgram={program.id_program} value={idJadwal} onChange={(v) => setParams(v ? { jadwal: v } : {})} />
      {idJadwal && (
        <Loadable loading={loading} error={error}>
          {data && (
            <>
              {rekap && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Hadir" value={rekap.hadir} />
                  <StatCard label="Izin" value={rekap.izin} accent="sky" />
                  <StatCard label="Sakit" value={rekap.sakit} accent="amber" />
                  <StatCard label="Alpa" value={rekap.alpa} accent="stone" />
                </div>
              )}
              <Card title={`Absensi: ${data.jadwal.kegiatan}`} bodyClassName="p-0">
                {rows.length === 0 ? <EmptyState>Program ini belum memiliki peserta. Admin perlu mendaftarkan siswa terlebih dahulu.</EmptyState> : (
                  <form onSubmit={simpan}>
                    <TableWrap>
                      <table className="table">
                        <thead><tr><th>Siswa</th><th>Status kehadiran</th><th>Keterangan</th></tr></thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={r.id_peserta}>
                              <td><p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{r.nama}</p><p className="mt-0.5 font-mono text-xs text-stone-500 tabular-nums dark:text-[#737373]">{r.nim || '-'}</p></td>
                              <td>
                                <fieldset className="inline-flex flex-wrap gap-0.5 rounded-lg border border-stone-200 bg-stone-50 p-0.5 dark:border-[#383838] dark:bg-[#171717]">
                                  <legend className="sr-only">Status {r.nama}</legend>
                                  {STATUS_ABSENSI.map((s) => (
                                    <label key={s} className="cursor-pointer">
                                      <input type="radio" name={`status-${r.id_peserta}`} value={s} checked={r.status === s}
                                        onChange={() => setRow(i, { status: s })} className="peer sr-only" />
                                      <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium text-stone-600 transition peer-checked:text-white peer-checked:shadow-xs peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 hover:text-stone-900 dark:text-[#A3A3A3] dark:hover:text-[#F2F2F2] dark:peer-focus-visible:ring-emerald-500 ${WARNA[s]}`}>
                                        {label(s)}
                                      </span>
                                    </label>
                                  ))}
                                </fieldset>
                              </td>
                              <td><input className="input min-w-44" maxLength={1000} placeholder="Opsional" value={r.keterangan}
                                onChange={(e) => setRow(i, { keterangan: e.target.value })} aria-label={`Keterangan ${r.nama}`} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableWrap>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/50 px-5 py-3.5 dark:border-[#383838] dark:bg-[#1C1C1C]/80">
                      <div className="flex gap-2">
                        <button type="button" className="btn-secondary btn-sm" onClick={() => setRows((r) => r.map((x) => ({ ...x, status: 'hadir' })))}>Tandai semua hadir</button>
                      </div>
                      <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan absensi'}</button>
                    </div>
                    {pesan && <div className="px-5 pb-4"><Alert className="mb-0">{pesan}</Alert></div>}
                  </form>
                )}
              </Card>
            </>
          )}
        </Loadable>
      )}
    </>
  )
}
