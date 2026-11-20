import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage, fieldErrors } from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'
import { Alert, Card, EmptyState, Input, Loadable, Modal, PageHeader, Select, StatusBadge, TableWrap, Textarea } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { periode } from '../../utils/format'
import { toOptions } from '../../utils/labels'

const EMPTY = { nama_program: '', jenis: 'rutin', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '' }

export default function ProgramPendidikan() {
  const notify = useToast()
  const { data: program, loading, error, reload } = useFetch('/program', [])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [hapus, setHapus] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function openForm(p) {
    setForm(p ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, p[k] ?? ''])) : EMPTY)
    setErrors({})
    setModal({ item: p })
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.nama_program.trim()) errs.nama_program = 'Nama program wajib diisi'
    if (form.tanggal_mulai && form.tanggal_selesai && form.tanggal_selesai < form.tanggal_mulai) errs.tanggal_selesai = 'Tanggal selesai tidak boleh sebelum tanggal mulai'
    if (Object.keys(errs).length) return setErrors(errs)
    setSaving(true)
    try {
      if (modal.item) await api.put(`/program/${modal.item.id_program}`, form)
      else await api.post('/program', form)
      notify('success', modal.item ? 'Program berhasil diperbarui' : 'Program berhasil ditambahkan')
      setModal(null)
      reload()
    } catch (err) {
      setErrors({ ...fieldErrors(err), _form: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api.delete(`/program/${hapus.id_program}`)
      notify('success', `Program "${hapus.nama_program}" dihapus`)
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
      <PageHeader title="Program Pendidikan" subtitle="Inagurasi, Diklatsar, dan program tambahan. Gunakan Kelola untuk kurikulum, materi, dan peserta."
        actions={<button type="button" className="btn-primary" onClick={() => openForm(null)}>+ Tambah program</button>} />
      <Card bodyClassName="p-0">
        <Loadable loading={loading} error={error}>
          {program.length === 0 ? <EmptyState>Belum ada program pendidikan.</EmptyState> : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>Program</th><th>Jenis</th><th>Periode</th><th className="text-center">Peserta</th><th className="text-center">Materi</th><th className="text-right">Aksi</th></tr></thead>
                <tbody>
                  {program.map((p) => (
                    <tr key={p.id_program}>
                      <td className="max-w-xs"><p className="font-medium text-stone-900 dark:text-[#F2F2F2]">{p.nama_program}</p>{p.deskripsi && <p className="mt-0.5 line-clamp-1 text-xs text-stone-500 dark:text-[#A3A3A3]">{p.deskripsi}</p>}</td>
                      <td><StatusBadge status={p.jenis} /></td>
                      <td className="whitespace-nowrap text-stone-600 dark:text-[#A3A3A3]">{periode(p.tanggal_mulai, p.tanggal_selesai)}</td>
                      <td className="text-center font-medium tabular-nums">{p.jumlah_peserta}</td>
                      <td className="text-center font-medium tabular-nums">{p.jumlah_materi}</td>
                      <td className="text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link to={`/admin/program/${p.id_program}`} className="btn-secondary btn-sm">Kelola</Link>
                          <button type="button" className="btn-ghost btn-sm" onClick={() => openForm(p)}>Edit</button>
                          <button type="button" className="btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/45 dark:hover:text-red-300" onClick={() => setHapus(p)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Loadable>
      </Card>

      <Modal open={Boolean(modal)} title={modal?.item ? 'Edit program' : 'Tambah program'} onClose={() => setModal(null)}
        footer={<>
          <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button type="submit" form="form-program" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </>}>
        <form id="form-program" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Alert className="sm:col-span-2">{errors._form}</Alert>
          <Input label="Nama program" required maxLength={150} value={form.nama_program} error={errors.nama_program} onChange={set('nama_program')} className="sm:col-span-2" />
          <Select label="Jenis" required value={form.jenis} error={errors.jenis} onChange={set('jenis')} options={toOptions(['rutin', 'tambahan'])} className="sm:col-span-2" />
          <Input label="Tanggal mulai" type="date" value={form.tanggal_mulai} error={errors.tanggal_mulai} onChange={set('tanggal_mulai')} />
          <Input label="Tanggal selesai" type="date" min={form.tanggal_mulai || undefined} value={form.tanggal_selesai} error={errors.tanggal_selesai} onChange={set('tanggal_selesai')} />
          <Textarea label="Deskripsi" value={form.deskripsi} error={errors.deskripsi} onChange={set('deskripsi')} className="sm:col-span-2" />
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(hapus)} title="Hapus program" loading={deleting} onCancel={() => setHapus(null)} onConfirm={confirmDelete}
        message={hapus && `Hapus program "${hapus.nama_program}"? Program yang masih memiliki kurikulum, materi, jadwal, atau peserta tidak dapat dihapus.`} />
    </>
  )
}
