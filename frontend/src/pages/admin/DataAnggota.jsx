import { useEffect, useState } from 'react'
import api, { errorMessage, fieldErrors } from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'
import { Alert, Card, EmptyState, Input, Loadable, Modal, PageHeader, Select, StatusBadge, TableWrap } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { STATUS_KEANGGOTAAN, toOptions } from '../../utils/labels'

const EMPTY = { nama: '', email: '', password: '', no_hp: '', nim: '', jurusan: '', angkatan: '', kontak: '', status_keanggotaan: 'calon_siswa', status_akun: 'aktif' }

export default function DataAnggota() {
  const notify = useToast()
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const { data: anggota, loading, error, reload } = useFetch(`/anggota${query ? `?q=${encodeURIComponent(query)}` : ''}`, [])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [hapus, setHapus] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [akunBaru, setAkunBaru] = useState(null)

  // Cari dengan jeda agar tidak memanggil API setiap ketikan.
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const isEdit = modal?.mode === 'edit'
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function openForm(a) {
    setForm(a ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, a[k] ?? ''])) : EMPTY)
    setErrors({})
    setModal(a ? { mode: 'edit', item: a } : { mode: 'add' })
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Format email tidak valid'
    if (!isEdit && form.password && form.password.length < 8) errs.password = 'Password awal minimal 8 karakter'
    if (Object.keys(errs).length) return setErrors(errs)
    setSaving(true)
    try {
      if (isEdit) {
        const { password: _, ...payload } = form
        await api.put(`/anggota/${modal.item.id_anggota}`, payload)
        notify('success', 'Data anggota berhasil diperbarui')
      } else {
        const { status_akun: _, ...payload } = form
        const res = await api.post('/anggota', payload)
        notify('success', res.data.message)
        setAkunBaru({ email: res.data.data.email, password: res.data.data.password_sementara })
      }
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
      await api.delete(`/anggota/${hapus.id_anggota}`)
      notify('success', `Anggota "${hapus.nama}" dihapus`)
      setHapus(null)
      reload()
    } catch (err) {
      notify('error', errorMessage(err))
      setHapus(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader title="Data Anggota" subtitle="Menambah anggota otomatis membuat akun login Siswa."
        actions={<button type="button" className="btn-primary" onClick={() => openForm(null)}>+ Tambah anggota</button>} />

      {akunBaru && (
        <Alert type="success" onClose={() => setAkunBaru(null)}>
          Akun Siswa dibuat untuk <b>{akunBaru.email}</b>.{' '}
          {akunBaru.password
            ? <>Password sementara: <code className="rounded bg-white px-1.5 py-0.5 font-mono">{akunBaru.password}</code> — catat sekarang, hanya ditampilkan sekali.</>
            : 'Gunakan password awal yang Anda isi.'}
        </Alert>
      )}

      <Card bodyClassName="p-0">
        <div className="border-b border-stone-100 p-3">
          <input className="input max-w-sm" type="search" placeholder="Cari nama, email, atau NIM..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari anggota" />
        </div>
        <Loadable loading={loading} error={error}>
          {anggota.length === 0 ? <EmptyState>{query ? 'Tidak ada anggota yang cocok dengan pencarian.' : 'Belum ada anggota.'}</EmptyState> : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>Nama</th><th>NIM</th><th>Jurusan / Angkatan</th><th>Kontak</th><th>Keanggotaan</th><th>Akun</th><th className="text-right">Aksi</th></tr></thead>
                <tbody>
                  {anggota.map((a) => (
                    <tr key={a.id_anggota}>
                      <td><p className="font-medium">{a.nama}</p><p className="text-xs text-stone-500">{a.email}</p></td>
                      <td className="tabular-nums">{a.nim || '-'}</td>
                      <td>{a.jurusan || '-'}<p className="text-xs text-stone-500">{a.angkatan || ''}</p></td>
                      <td>{a.kontak || a.no_hp || '-'}</td>
                      <td><StatusBadge status={a.status_keanggotaan} /></td>
                      <td><StatusBadge status={a.status_akun} /></td>
                      <td className="text-right whitespace-nowrap">
                        <button type="button" className="btn-ghost btn-sm" onClick={() => openForm(a)}>Edit</button>
                        <button type="button" className="btn-ghost btn-sm text-red-600" onClick={() => setHapus(a)}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Loadable>
      </Card>

      <Modal open={Boolean(modal)} size="lg" title={isEdit ? 'Edit anggota' : 'Tambah anggota'} onClose={() => setModal(null)}
        footer={<>
          <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button type="submit" form="form-anggota" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </>}>
        <form id="form-anggota" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Alert className="sm:col-span-2">{errors._form}</Alert>
          <Input label="Nama lengkap" required maxLength={100} value={form.nama} error={errors.nama} onChange={set('nama')} className="sm:col-span-2" />
          <Input label="Email (untuk login)" type="email" required value={form.email} error={errors.email} onChange={set('email')} />
          {isEdit ? (
            <Select label="Status akun" value={form.status_akun} error={errors.status_akun} onChange={set('status_akun')}
              options={[{ value: 'aktif', label: 'Aktif (bisa login)' }, { value: 'nonaktif', label: 'Nonaktif (tidak bisa login)' }]} />
          ) : (
            <Input label="Password awal" type="password" autoComplete="new-password" value={form.password} error={errors.password} onChange={set('password')}
              hint="Opsional, minimal 8 karakter. Kosongkan agar sistem membuat password sementara." />
          )}
          <Input label="NIM" maxLength={20} value={form.nim} error={errors.nim} onChange={set('nim')} />
          <Input label="Jurusan" maxLength={100} value={form.jurusan} error={errors.jurusan} onChange={set('jurusan')} />
          <Input label="Angkatan" maxLength={10} placeholder="mis. 2025" value={form.angkatan} error={errors.angkatan} onChange={set('angkatan')} />
          <Input label="No. HP" maxLength={20} value={form.no_hp} error={errors.no_hp} onChange={set('no_hp')} />
          <Input label="Kontak lain" maxLength={50} value={form.kontak} error={errors.kontak} onChange={set('kontak')} />
          <Select label="Status keanggotaan" required value={form.status_keanggotaan} error={errors.status_keanggotaan} onChange={set('status_keanggotaan')} options={toOptions(STATUS_KEANGGOTAAN)} />
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(hapus)} title="Hapus anggota" loading={deleting} onCancel={() => setHapus(null)} onConfirm={confirmDelete}
        message={hapus && `Hapus anggota "${hapus.nama}" beserta akun loginnya? Anggota yang sudah terdaftar di program tidak dapat dihapus.`} />
    </>
  )
}
