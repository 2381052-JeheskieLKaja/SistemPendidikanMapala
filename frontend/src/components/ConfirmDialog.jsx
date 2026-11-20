import { Modal } from './ui'

/** Dialog konfirmasi untuk tindakan penting (mis. hapus). */
export default function ConfirmDialog({ open, title = 'Konfirmasi', message, confirmLabel = 'Hapus', loading, onConfirm, onCancel }) {
  return (
    <Modal
      open={open} title={title} onClose={loading ? undefined : onCancel} size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>Batal</button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={loading}>{loading ? 'Memproses...' : confirmLabel}</button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-stone-600 dark:text-[#A3A3A3]">{message}</p>
    </Modal>
  )
}
