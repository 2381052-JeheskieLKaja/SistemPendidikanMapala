import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api, { errorMessage, fieldErrors } from '../../api/axios'
import { useToast } from '../../components/Toast'
import { Alert, Card, EmptyState, Input, Loadable, Modal, Select, StatusBadge, TableWrap, Textarea } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { toOptions } from '../../utils/labels'

const EMPTY = { tahun: String(new Date().getFullYear()), deskripsi: '', status: 'draft' }

export default function Kurikulum() {
  const { program } = useOutletContext()
  const notify = useToast()
  const { data: kurikulum, loading, error, reload } = useFetch(`/kurikulum?id_program=${program.id_program}`, [])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function openForm(k) {
    setForm(k ? { tahun: k.tahun, deskripsi: k.deskripsi || '', status: k.status } : EMPTY)
    setErrors({})
    setModal({ item: k })
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.tahun.trim()) return setErrors({ tahun: 'Tahun wajib diisi' })
    setSaving(true)
    try {
      if (modal.item) await api.put(`/kurikulum/${modal.item.id_kurikulum}`, form)
      else await api.post('/kurikulum', { ...form, id_program: program.id_program })
      notify('success', modal.item ? 'Kurikulum berhasil diperbarui' : 'Kurikulum berhasil ditambahkan')
      setModal(null)
      reload()
    } catch (err) {
      setErrors({ ...fieldErrors(err), _form: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>+ Tambah kurikulum</button>
      </div>
      <Card bodyClassName="p-0">
        <Loadable loading={loading} error={error}>
          {kurikulum.length === 0 ? <EmptyState>Program ini belum memiliki kurikulum.</EmptyState> : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>Tahun</th><th>Deskripsi</th><th>Status</th><th className="text-right">Aksi</th></tr></thead>
                <tbody>
                  {kurikulum.map((k) => (
                    <tr key={k.id_kurikulum}>
                      <td className="font-semibold text-stone-900 tabular-nums dark:text-[#F2F2F2]">{k.tahun}</td>
                      <td className="max-w-md whitespace-pre-line leading-relaxed text-stone-600 dark:text-[#A3A3A3]">{k.deskripsi || '-'}</td>
                      <td><StatusBadge status={k.status} /></td>
                      <td className="text-right"><button type="button" className="btn-ghost btn-sm" onClick={() => openForm(k)}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Loadable>
      </Card>

      <Modal open={Boolean(modal)} title={modal?.item ? 'Edit kurikulum' : 'Tambah kurikulum'} onClose={() => setModal(null)}
        footer={<>
          <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button type="submit" form="form-kurikulum" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </>}>
        <form id="form-kurikulum" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Alert className="sm:col-span-2">{errors._form}</Alert>
          <Input label="Tahun" required maxLength={10} value={form.tahun} error={errors.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} />
          <Select label="Status" required value={form.status} error={errors.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={toOptions(['draft', 'diresmikan'])} />
          <Textarea label="Deskripsi" rows={5} value={form.deskripsi} error={errors.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="sm:col-span-2" />
        </form>
      </Modal>
    </>
  )
}
