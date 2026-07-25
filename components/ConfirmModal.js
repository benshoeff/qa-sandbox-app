export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div data-testid="modal-icon" className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 data-testid="modal-title" className="text-lg font-semibold text-gray-900">{title}</h3>
            <p data-testid="modal-description" className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button data-testid="modal-cancel-button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button data-testid="modal-delete-button" className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
