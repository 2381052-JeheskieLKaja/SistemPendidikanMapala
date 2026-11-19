import api, { errorMessage } from '../api/axios'

/**
 * Buka berkas materi lewat endpoint terproteksi (GET /api/materi/:id/file) sebagai blob di tab baru.
 * Tab dibuka lebih dulu agar tidak diblokir popup blocker. Mengembalikan pesan error atau ''.
 */
export async function bukaBerkas(idMateri) {
  const win = window.open('', '_blank')
  try {
    const res = await api.get(`/materi/${idMateri}/file`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    if (win) win.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return ''
  } catch (err) {
    win?.close()
    if (err.response?.data instanceof Blob) {
      try {
        return JSON.parse(await err.response.data.text()).message || 'Gagal membuka berkas materi'
      } catch {
        /* pakai pesan umum */
      }
    }
    return errorMessage(err, 'Gagal membuka berkas materi')
  }
}
