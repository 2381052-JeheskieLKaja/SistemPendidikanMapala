import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../../api/axios'
import { useToast } from '../../components/Toast'
import { Alert, Badge, Card, EmptyState, Loadable, Modal, PageHeader, StatusBadge } from '../../components/ui'
import useFetch from '../../hooks/useFetch'
import { formatTanggalWaktu } from '../../utils/format'
import { groupBy } from '../../utils/labels'
import { bukaBerkas } from '../../utils/materi'
import BelumTerdaftar from './BelumTerdaftar'

export default function SiswaMateri() {
  const notify = useToast()
  const [params, setParams] = useSearchParams()
  const { data, loading, error, reload } = useFetch('/materi/saya')
  const [isi, setIsi] = useState(null)
  const [membuka, setMembuka] = useState(null)
  const [gagal, setGagal] = useState('')
  const autoOpened = useRef(null)

  // Urutan sesuai Gambar 13: catat akses dulu (tandai-akses), baru tampilkan isi materi.
  async function buka(idMateri) {
    setMembuka(idMateri)
    setGagal('')
    try {
      const res = await api.post('/progres/tandai-akses', { id_materi: idMateri })
      setIsi(res.data.data.materi)
      reload()
    } catch (err) {
      setGagal(errorMessage(err, 'Gagal membuka materi'))
    } finally {
      setMembuka(null)
    }
  }

  // Dari notifikasi: /siswa/materi?materi=<id> langsung membuka materi tersebut.
  const target = params.get('materi')
  useEffect(() => {
    if (!target || autoOpened.current === target) return
    autoOpened.current = target
    buka(Number(target))
    setParams({}, { replace: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  async function lihatBerkas() {
    const msg = await bukaBerkas(isi.id_materi)
    if (msg) notify('error', msg)
  }

  return (
    <>
      <PageHeader title="Materi" subtitle="Modul pendidikan dari program yang Anda ikuti. Materi yang dibuka tercatat sebagai progres." />
      <Alert onClose={() => setGagal('')}>{gagal}</Alert>
      <Loadable loading={loading && !data} error={error}>
        {data && (data.program.length === 0 ? <BelumTerdaftar /> : (
          <div className="space-y-8">
            {data.program.map((p) => {
              const materi = data.materi.filter((m) => m.id_program === p.id_program)
              return (
                <section key={p.id_program}>
                  <h2 className="mb-3 font-semibold text-stone-800">{p.nama_program}</h2>
                  {materi.length === 0 ? <Card><EmptyState>Belum ada materi pada program ini.</EmptyState></Card> : (
                    <div className="space-y-4">
                      {groupBy(materi, 'kategori').map(([kategori, items]) => (
                        <Card key={kategori} title={kategori} bodyClassName="p-0">
                          <ul className="divide-y divide-stone-100">
                            {items.map((m) => (
                              <li key={m.id_materi}>
                                <button type="button" onClick={() => buka(m.id_materi)} disabled={membuka === m.id_materi}
                                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-stone-50 disabled:opacity-60">
                                  <span className="min-w-0">
                                    <span className="block font-medium text-stone-900">{m.judul}</span>
                                    <span className="block text-xs text-stone-500">Diunggah {formatTanggalWaktu(m.tanggal_upload)}{m.has_file ? ` · berkas ${m.ekstensi_file?.toUpperCase()}` : ''}</span>
                                  </span>
                                  <span className="shrink-0">{membuka === m.id_materi ? <span className="text-xs text-stone-500">Membuka...</span> : <StatusBadge status={m.status_akses} />}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        ))}
      </Loadable>

      <Modal open={Boolean(isi)} size="lg" title={isi?.judul || ''} onClose={() => setIsi(null)}
        footer={<>
          {isi?.has_file && <button type="button" className="btn-primary" onClick={lihatBerkas}>Buka berkas</button>}
          <button type="button" className="btn-secondary" onClick={() => setIsi(null)}>Tutup</button>
        </>}>
        {isi && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2"><Badge color="blue">{isi.kategori}</Badge><Badge color="green">Tercatat sudah diakses</Badge></div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">{isi.deskripsi || 'Materi ini tidak memiliki deskripsi.'}</p>
            {isi.has_file && <p className="text-xs text-stone-500">Materi ini memiliki berkas {isi.ekstensi_file?.toUpperCase()}.</p>}
          </div>
        )}
      </Modal>
    </>
  )
}
