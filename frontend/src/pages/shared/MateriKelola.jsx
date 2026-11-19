import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api, { errorMessage, fieldErrors } from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'
import { Alert, Badge, Card, EmptyState, Input, Loadable, Modal, Textarea } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggalWaktu } from '../../utils/format'
import { groupBy } from '../../utils/labels'
import { bukaBerkas } from '../../utils/materi'

const EMPTY = { judul: '', kategori: '', deskripsi: '' }
const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4'
const MAX_MB = 20

/** Kelola materi per kategori — dipakai Admin dan Pengurus (komponen yang sama). */
export default function MateriKelola() {
  const { program, reloadProgram } = useOutletContext()
  const notify = useToast()
  const { data: materi, loading, error, reload } = useFetch(`/materi?id_program=${program.id_program}`, [])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [hapus, setHapus] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const kategoriList = [...new Set(materi.map((m) => m.kategori))]
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function open(item) {
    setForm(item ? { judul: item.judul, kategori: item.kategori, deskripsi: item.deskripsi || '' } : EMPTY)
    setFile(null)
    setErrors({})
    setModal({ item })
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.judul.trim()) errs.judul = 'Judul wajib diisi'
    if (!form.kategori.trim()) errs.kategori = 'Kategori wajib diisi'
    if (file && file.size > MAX_MB * 1024 * 1024) errs.file = `Ukuran file maksimal ${MAX_MB} MB`
    if (Object.keys(errs).length) return setErrors(errs)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (file) fd.append('file', file)
    setSaving(true)
    try {
      if (modal.item) {
        await api.put(`/materi/${modal.item.id_materi}`, fd)
        notify('success', 'Materi berhasil diperbarui')
      } else {
        fd.append('id_program', program.id_program)
        const res = await api.post('/materi', fd)
        notify('success', res.data.message)
      }
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
      await api.delete(`/materi/${hapus.id_materi}`)
      notify('success', `Materi "${hapus.judul}" dihapus`)
      setHapus(null)
      reload()
    } catch (err) {
      notify('error', errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  async function lihatBerkas(m) {
    const msg = await bukaBerkas(m.id_materi)
    if (msg) notify('error', msg)
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-600">Materi dikelompokkan per kategori. Menambah materi mengirim notifikasi ke setiap siswa program ini.</p>
        <button type="button" className="btn-primary" onClick={() => open(null)}>+ Tambah materi</button>
      </div>
      <Loadable loading={loading} error={error}>
        {materi.length === 0 ? <Card><EmptyState>Belum ada materi pada program ini.</EmptyState></Card> : (
          <div className="space-y-4">
            {groupBy(materi, 'kategori').map(([kategori, items]) => (
              <Card key={kategori} title={<span>{kategori} <span className="ml-1 text-sm font-normal text-stone-400">({items.length})</span></span>} bodyClassName="p-0">
                <ul className="divide-y divide-stone-100">
                  {items.map((m) => (
                    <li key={m.id_materi} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">{m.judul}</p>
                        {m.deskripsi && <p className="line-clamp-2 text-sm text-stone-600">{m.deskripsi}</p>}
                        <p className="mt-1 text-xs text-stone-500">Diunggah {formatTanggalWaktu(m.tanggal_upload)}{' '}
                          {m.has_file && <Badge color="blue">{m.ekstensi_file?.toUpperCase()}</Badge>}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {m.has_file && <button type="button" className="btn-ghost btn-sm" onClick={() => lihatBerkas(m)}>Lihat berkas</button>}
                        <button type="button" className="btn-ghost btn-sm" onClick={() => open(m)}>Edit</button>
                        <button type="button" className="btn-ghost btn-sm text-red-600" onClick={() => setHapus(m)}>Hapus</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </Loadable>

      <Modal open={Boolean(modal)} title={modal?.item ? 'Edit materi' : 'Tambah materi'} onClose={() => setModal(null)}
        footer={<>
          <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button type="submit" form="form-materi" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </>}>
        <form id="form-materi" onSubmit={submit} className="space-y-4" noValidate>
          <Alert>{errors._form}</Alert>
          <Input label="Judul" required maxLength={150} value={form.judul} error={errors.judul} onChange={set('judul')} />
          <Input label="Kategori" required maxLength={100} list="kategori-list" placeholder="mis. Survival, Navigasi, P3K" value={form.kategori} error={errors.kategori} onChange={set('kategori')} />
          <datalist id="kategori-list">
            {[...new Set([...kategoriList, 'Survival', 'Backpacking', 'Tali-temali dan Tandu', 'P3K', 'BHD', 'Navigasi'])].map((k) => <option key={k} value={k} />)}
          </datalist>
          <Textarea label="Deskripsi / isi materi" rows={5} value={form.deskripsi} error={errors.deskripsi} onChange={set('deskripsi')} />
          <div>
            <label htmlFor="file-materi" className="label">Berkas {modal?.item?.has_file && <span className="font-normal text-stone-500">(kosongkan bila tidak diganti)</span>}</label>
            <input id="file-materi" type="file" accept={ACCEPT} className="input file:mr-3 file:rounded file:border-0 file:bg-stone-100 file:px-2 file:py-1"
              onChange={(e) => setFile(e.target.files?.[0] || null)} aria-invalid={Boolean(errors.file)} />
            {errors.file ? <p className="mt-1 text-xs text-red-600">{errors.file}</p>
              : <p className="mt-1 text-xs text-stone-500">Opsional. PDF, Office, TXT, JPG/PNG, atau MP4. Maks {MAX_MB} MB.</p>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(hapus)} title="Hapus materi" loading={deleting} onCancel={() => setHapus(null)} onConfirm={confirmDelete}
        message={hapus && `Hapus materi "${hapus.judul}"? Berkas, progres akses, dan notifikasi terkait juga dihapus.`} />
    </>
  )
}
