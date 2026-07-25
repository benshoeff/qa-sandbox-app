import { useState, useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, ...rest }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }
  }, [message])

  if (!message) return null

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`} {...rest}
    >
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${
        type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
        type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
        'bg-blue-50 text-blue-800 border-blue-200'
      }`}>
        {type === 'success' && (
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="text-sm font-medium">{message}</span>
        <button data-testid="toast-close-button" onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 text-current opacity-50 hover:opacity-100 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
