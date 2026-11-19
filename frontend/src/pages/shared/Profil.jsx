import { useEffect, useState } from 'react'
import api, { errorMessage, fieldErrors } from '../../api/axios'
import { useToast } from '../../components/Toast'
import { Alert, Card, Input, Loadable, PageHeader, StatusBadge } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import useFetch from '../../hooks/useFetch'

const PW_EMPTY = { password_lama: '', password_baru: '', konfirmasi: '' }

/** Profil milik sendiri — dipakai Admin, Pengurus, Siswa. */
export default function Profil() {
  const { updateUser } = useAuth()
  const notify = useToast()
  const { data: profil, loading, error, reload } = useFetch('/profil/me')
  const [form, setForm] = useState({ nama: '', email: '', no_hp: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState(PW_EMPTY)
  const [pwErrors, setPwErrors] = useState({})
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (profil) setForm({ nama: profil.nama, email: profil.email, no_hp: profil.no_hp || '' })
  }, [profil])

  async function simpan(e) {
    e.preventDefault()
    const errs = {}
    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Format email tidak valid'
    if (Object.keys(errs).length) return setErrors(errs)
    setSaving(true)
    setErrors({})
    try {
      const res = await api.put('/profil/me', form)
      updateUser({ nama: res.data.data.nama })
      notify('success', 'Profil berhasil diperbarui')
      reload()
    } catch (err) {
      setErrors({ ...fieldErrors(err), _form: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  async function gantiPassword(e) {
    e.preventDefault()
    const errs = {}
    if (!pw.password_lama) errs.password_lama = 'Password lama wajib diisi'
    if (pw.password_baru.length < 8) errs.password_baru = 'Password baru minimal 8 karakter'
    if (pw.konfirmasi !== pw.password_baru) errs.konfirmasi = 'Konfirmasi password tidak sama'
    if (Object.keys(errs).length) return setPwErrors(errs)
    setPwSaving(true)
    setPwErrors({})
    try {
      await api.put('/profil/me/password', pw)
      setPw(PW_EMPTY)
      notify('success', 'Password berhasil diganti')
    } catch (err) {
      setPwErrors({ ...fieldErrors(err), _form: errorMessage(err) })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Profil" subtitle="Perbarui data diri dan password akun Anda." />
      <Loadable loading={loading} error={error}>
        {profil && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Data diri" className="lg:col-span-2">
              <form onSubmit={simpan} className="grid gap-4 sm:grid-cols-2" noValidate>
                <Alert className="sm:col-span-2">{errors._form}</Alert>
                <Input label="Nama" required maxLength={100} value={form.nama} error={errors.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="sm:col-span-2" />
                <Input label="Email" type="email" required value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="No. HP" maxLength={20} value={form.no_hp} error={errors.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
                <div className="sm:col-span-2"><button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></div>
              </form>
            </Card>

            <Card title="Akun">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-2"><dt className="text-stone-500">Peran</dt><dd><StatusBadge status={profil.role} /></dd></div>
                <div className="flex justify-between gap-2"><dt className="text-stone-500">Status</dt><dd><StatusBadge status={profil.status} /></dd></div>
                {profil.role === 'siswa' && (
                  <>
                    <div className="flex justify-between gap-2"><dt className="text-stone-500">NIM</dt><dd>{profil.nim || '-'}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-stone-500">Keanggotaan</dt><dd><StatusBadge status={profil.status_keanggotaan} /></dd></div>
                  </>
                )}
              </dl>
              <p className="mt-4 text-xs text-stone-500">Peran, status, dan data keanggotaan hanya dapat diubah oleh Admin.</p>
            </Card>

            <Card title="Ganti password" className="lg:col-span-2">
              <form onSubmit={gantiPassword} className="grid gap-4 sm:grid-cols-3" noValidate>
                <Alert className="sm:col-span-3">{pwErrors._form}</Alert>
                <Input label="Password lama" type="password" autoComplete="current-password" value={pw.password_lama} error={pwErrors.password_lama} onChange={(e) => setPw({ ...pw, password_lama: e.target.value })} />
                <Input label="Password baru" type="password" autoComplete="new-password" value={pw.password_baru} error={pwErrors.password_baru} hint="Minimal 8 karakter" onChange={(e) => setPw({ ...pw, password_baru: e.target.value })} />
                <Input label="Konfirmasi password" type="password" autoComplete="new-password" value={pw.konfirmasi} error={pwErrors.konfirmasi} onChange={(e) => setPw({ ...pw, konfirmasi: e.target.value })} />
                <div className="sm:col-span-3"><button type="submit" className="btn-primary" disabled={pwSaving}>{pwSaving ? 'Memproses...' : 'Ganti password'}</button></div>
              </form>
            </Card>
          </div>
        )}
      </Loadable>
    </>
  )
}
