import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api, { errorMessage } from '../../api/axios'
import { useToast } from '../../components/Toast'
import { Alert, Card, EmptyState, Loadable, StatusBadge, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal } from '../../utils/format'

export default function Peserta() {
  const { program, reloadProgram } = useOutletContext()
  const notify = useToast()
  const { data: peserta, loading, error, reload } = useFetch(`/peserta?id_program=${program.id_program}`, [])
  const { data: anggota } = useFetch('/anggota', [])
  const [idAnggota, setIdAnggota] = useState('')
  const [pesan, setPesan] = useState('')
  const [saving, setSaving] = useState(false)

  const terdaftar = new Set(peserta.map((p) => p.id_anggota))

  async function daftarkan(e) {
    e.preventDefault()
    if (!idAnggota) return setPesan('Pilih siswa terlebih dahulu')
    setSaving(true)
    setPesan('')
    try {
      await api.post('/peserta', { id_anggota: Number(idAnggota), id_program: program.id_program })
      notify('success', 'Siswa berhasil didaftarkan ke program')
      setIdAnggota('')
      reload()
      reloadProgram()
    } catch (err) {
      setPesan(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Daftarkan siswa">
        <form onSubmit={daftarkan} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="pilih-siswa" className="label">Siswa (anggota)</label>
            <select id="pilih-siswa" className="input" value={idAnggota} onChange={(e) => { setIdAnggota(e.target.value); setPesan('') }}>
              <option value="">— Pilih siswa —</option>
              {anggota.map((a) => (
                <option key={a.id_anggota} value={a.id_anggota}>
                  {a.nama}{a.nim ? ` (${a.nim})` : ''}{terdaftar.has(a.id_anggota) ? ' — sudah terdaftar' : ''}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Memproses...' : 'Daftarkan'}</button>
        </form>
        <Alert className="mt-3 mb-0">{pesan}</Alert>
      </Card>

      <Card title={`Peserta program (${peserta.length})`} bodyClassName="p-0">
        <Loadable loading={loading} error={error}>
          {peserta.length === 0 ? <EmptyState>Belum ada siswa yang terdaftar pada program ini.</EmptyState> : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>Nama</th><th>NIM</th><th>Jurusan / Angkatan</th><th>Keanggotaan</th><th>Tanggal daftar</th><th>Status</th></tr></thead>
                <tbody>
                  {peserta.map((p) => (
                    <tr key={p.id_peserta}>
                      <td><p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{p.nama}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-[#A3A3A3]">{p.email}</p></td>
                      <td className="font-mono text-xs text-stone-700 tabular-nums dark:text-[#A3A3A3]">{p.nim || '-'}</td>
                      <td>{p.jurusan || '-'}<p className="mt-0.5 text-xs text-stone-500 tabular-nums dark:text-[#737373]">{p.angkatan || ''}</p></td>
                      <td><StatusBadge status={p.status_keanggotaan} /></td>
                      <td className="whitespace-nowrap">{formatTanggal(p.tanggal_daftar)}</td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Loadable>
      </Card>
    </div>
  )
}
