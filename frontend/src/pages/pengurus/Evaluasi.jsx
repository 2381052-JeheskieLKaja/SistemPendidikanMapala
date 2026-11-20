import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../../api/axios'
import { useToast } from '../../components/Toast'
import { Alert, Card, EmptyState, Loadable } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal } from '../../utils/format'
import JadwalPicker from './JadwalPicker'

/** Catatan hasil penilaian lapangan per siswa (teks; tanpa nilai angka/kelulusan, K3). */
export default function Evaluasi() {
  const { program } = useOutletContext()
  const notify = useToast()
  const [params, setParams] = useSearchParams()
  const idJadwal = params.get('jadwal') || ''
  const { data, loading, error } = useFetch(idJadwal ? `/evaluasi?id_jadwal=${idJadwal}` : null)
  const [rows, setRows] = useState([])
  const [saved, setSaved] = useState([])
  const [errors, setErrors] = useState({})
  const [pesan, setPesan] = useState('')
  const [saving, setSaving] = useState(false)

  const fromApi = (peserta) => peserta.map((p) => ({ ...p, hasil_penilaian: p.hasil_penilaian || '', catatan: p.catatan || '' }))
  useEffect(() => {
    if (!data) return
    setRows(fromApi(data.peserta))
    setSaved(data.peserta)
    setErrors({})
    setPesan('')
  }, [data])

  const setRow = (i, patch) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  async function simpan(e) {
    e.preventDefault()
    const errs = {}
    rows.forEach((r) => { if (!r.hasil_penilaian.trim() && r.catatan.trim()) errs[r.id_peserta] = 'Hasil penilaian wajib diisi bila ada catatan' })
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (!rows.some((r) => r.hasil_penilaian.trim())) return setPesan('Isi hasil penilaian minimal untuk satu siswa')
    setSaving(true)
    setPesan('')
    try {
      const res = await api.post('/evaluasi', {
        id_jadwal: Number(idJadwal),
        data: rows.map(({ id_peserta: idPeserta, hasil_penilaian: hasil, catatan }) => ({ id_peserta: idPeserta, hasil_penilaian: hasil, catatan })),
      })
      setRows(fromApi(res.data.data.peserta))
      setSaved(res.data.data.peserta)
      notify('success', 'Evaluasi berhasil disimpan')
    } catch (err) {
      setPesan(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const tercatat = saved.filter((r) => r.id_evaluasi)

  return (
    <>
      <JadwalPicker idProgram={program.id_program} value={idJadwal} onChange={(v) => setParams(v ? { jadwal: v } : {})} />
      {idJadwal && (
        <Loadable loading={loading} error={error}>
          {data && (
            <div className="space-y-6">
              <Card title={`Evaluasi: ${data.jadwal.kegiatan}`} bodyClassName="p-0">
                {rows.length === 0 ? <EmptyState>Program ini belum memiliki peserta.</EmptyState> : (
                  <form onSubmit={simpan}>
                    <p className="border-b border-stone-100 bg-stone-50/50 px-5 py-3 text-sm text-stone-500 dark:border-[#383838] dark:bg-[#1C1C1C]/80 dark:text-[#A3A3A3]">Isi hasil penilaian lapangan. Baris yang dikosongkan tidak disimpan.</p>
                    <div className="divide-y divide-stone-100 dark:divide-[#383838]/75">
                      {rows.map((r, i) => (
                        <div key={r.id_peserta} className="grid gap-4 p-5 md:grid-cols-[12.5rem_1fr_1fr]">
                          <div>
                            <p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{r.nama}</p>
                            <p className="mt-0.5 font-mono text-xs text-stone-500 tabular-nums dark:text-[#737373]">{r.nim || '-'}</p>
                          </div>
                          <div>
                            <label htmlFor={`hasil-${r.id_peserta}`} className="label">Hasil penilaian</label>
                            <textarea id={`hasil-${r.id_peserta}`} rows={2} className={`input ${errors[r.id_peserta] ? 'input-error' : ''}`} maxLength={5000}
                              value={r.hasil_penilaian} onChange={(e) => setRow(i, { hasil_penilaian: e.target.value })} />
                            {errors[r.id_peserta] && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors[r.id_peserta]}</p>}
                          </div>
                          <div>
                            <label htmlFor={`catatan-${r.id_peserta}`} className="label">Catatan</label>
                            <textarea id={`catatan-${r.id_peserta}`} rows={2} className="input" maxLength={5000}
                              value={r.catatan} onChange={(e) => setRow(i, { catatan: e.target.value })} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {pesan && <div className="px-5 pt-3"><Alert className="mb-0">{pesan}</Alert></div>}
                    <div className="flex justify-end border-t border-stone-100 bg-stone-50/50 px-5 py-3.5 dark:border-[#383838] dark:bg-[#1C1C1C]/80">
                      <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan evaluasi'}</button>
                    </div>
                  </form>
                )}
              </Card>

              <Card title={`Rekap hasil evaluasi kegiatan (${tercatat.length} siswa)`} bodyClassName="p-0">
                {tercatat.length === 0 ? <EmptyState>Belum ada hasil evaluasi untuk kegiatan ini.</EmptyState> : (
                  <ul className="divide-y divide-stone-100 dark:divide-[#383838]/75">
                    {tercatat.map((r) => (
                      <li key={r.id_peserta} className="px-5 py-4 text-sm">
                        <p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{r.nama}</p>
                        <p className="mt-1.5 whitespace-pre-line leading-relaxed text-stone-700 dark:text-[#A3A3A3]">{r.hasil_penilaian}</p>
                        {r.catatan && <p className="mt-1.5 text-stone-500 dark:text-[#A3A3A3]">Catatan: {r.catatan}</p>}
                        <p className="mt-1.5 text-xs text-stone-400 dark:text-[#737373]">Dicatat oleh {r.pencatat} · {formatTanggal(r.tanggal_evaluasi)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </Loadable>
      )}
    </>
  )
}
