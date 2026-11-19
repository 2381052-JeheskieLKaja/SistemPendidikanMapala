import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api, { errorMessage, fieldErrors } from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'
import { Alert, Badge, Card, EmptyState, Input, Loadable, Modal, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggal, formatWaktu, hariIni } from '../../utils/format'

const EMPTY = { tanggal: '', waktu: '', lokasi: '', kegiatan: '' }

export default function Jadwal() {
  const { program, reloadProgram } = useOutletContext()
  const notify = useToast()
  const { data: jadwal, loading, error, reload } = useFetch(`/jadwal?id_program=${program.id_program}`, [])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [hapus, setHapus] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const today = hariIni()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function openForm(j) {
    setForm(j ? { tanggal: j.tanggal, waktu: j.waktu.slice(0, 5), lokasi: j.lokasi, kegiatan: j.kegiatan } : EMPTY)
    setErrors({})
    setModal({ item: j })
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    for (const [k, l] of [['tanggal', 'Tanggal'], ['waktu', 'Waktu'], ['lokasi', 'Lokasi'], ['kegiatan', 'Kegiatan']]) {
      if (!form[k].trim()) errs[k] = `${l} wajib diisi`
    }
    if (Object.keys(errs).length) return setErrors(errs)
    setSaving(true)
    try {
      if (modal.item) await api.put(`/jadwal/${modal.item.id_jadwal}`, form)
      else await api.post('/jadwal', { ...form, id_program: program.id_program })
      notify('success', modal.item ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil ditambahkan')
      setModal(null)
      reload()
      reloadProgram()
    } catch (err) {
      setErrors({ ...fieldErrors(err), _form: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api.delete(`/jadwal/${hapus.id_jadwal}`)
      notify('success', 'Jadwal berhasil dihapus')
      reload()
    } catch (err) {
      notify('error', errorMessage(err))
    } finally {
      setHapus(null)
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-600">Jadwal kegiatan terurut berdasarkan tanggal dan waktu.</p>
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>+ Tambah jadwal</button>
      </div>
      <Card bodyClassName="p-0">
        <Loadable loading={loading} error={error}>
          {jadwal.length === 0 ? <EmptyState>Belum ada jadwal kegiatan pada program ini.</EmptyState> : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>Tanggal</th><th>Waktu</th><th>Kegiatan</th><th>Lokasi</th><th>Pencatatan</th><th className="text-right">Aksi</th></tr></thead>
                <tbody>
                  {jadwal.map((j) => (
                    <tr key={j.id_jadwal} className={j.tanggal < today ? 'text-stone-500' : ''}>
                      <td className="whitespace-nowrap">{formatTanggal(j.tanggal, { hari: true })}</td>
                      <td className="tabular-nums">{formatWaktu(j.waktu)}</td>
                      <td className="font-medium text-stone-800">{j.kegiatan}</td>
                      <td>{j.lokasi}</td>
                      <td className="space-x-1 whitespace-nowrap">
                        <Badge color={j.jumlah_absensi ? 'green' : 'gray'}>Absensi {j.jumlah_absensi ? '✓' : '–'}</Badge>
                        <Badge color={j.jumlah_evaluasi ? 'green' : 'gray'}>Evaluasi {j.jumlah_evaluasi ? '✓' : '–'}</Badge>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button type="button" className="btn-ghost btn-sm" onClick={() => openForm(j)}>Edit</button>
                        <button type="button" className="btn-ghost btn-sm text-red-600" onClick={() => setHapus(j)}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Loadable>
      </Card>

      <Modal open={Boolean(modal)} title={modal?.item ? 'Edit jadwal' : 'Tambah jadwal'} onClose={() => setModal(null)}
        footer={<>
          <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button type="submit" form="form-jadwal" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </>}>
        <form id="form-jadwal" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Alert className="sm:col-span-2">{errors._form}</Alert>
          <Input label="Tanggal" type="date" required value={form.tanggal} error={errors.tanggal} onChange={set('tanggal')} />
          <Input label="Waktu" type="time" required value={form.waktu} error={errors.waktu} onChange={set('waktu')} />
          <Input label="Kegiatan" required maxLength={150} value={form.kegiatan} error={errors.kegiatan} onChange={set('kegiatan')} className="sm:col-span-2" />
          <Input label="Lokasi" required maxLength={150} value={form.lokasi} error={errors.lokasi} onChange={set('lokasi')} className="sm:col-span-2" />
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(hapus)} title="Hapus jadwal" loading={deleting} onCancel={() => setHapus(null)} onConfirm={confirmDelete}
        message={hapus && `Hapus jadwal "${hapus.kegiatan}" (${formatTanggal(hapus.tanggal)})? Jadwal yang sudah punya absensi atau evaluasi tidak dapat dihapus.`} />
    </>
  )
}
