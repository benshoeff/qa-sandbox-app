import { useState, useEffect } from 'react'

export default function FormModal({ open, onClose, onSubmit, fields, initialData, title }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (open) {
      if (initialData) {
        const initial = {}
        fields.forEach(f => { initial[f.key] = initialData[f.key] ?? '' })
        setForm(initial)
      } else {
        const empty = {}
        fields.forEach(f => { empty[f.key] = '' })
        setForm(empty)
      }
    }
  }, [open, initialData])

  if (!open) return null

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...form }
    fields.forEach(f => {
      if (f.type === 'number') data[f.key] = Number(data[f.key])
    })
    if (data.items && typeof data.items === 'string') {
      try { data.items = JSON.parse(data.items) } catch { data.items = [] }
    }
    onSubmit(data)
  }

  const renderField = (field) => {
    const value = form[field.key] ?? ''

    switch (field.type) {
      case 'select':
        return (
          <select
            className="input"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {(field.options || []).map((opt) => {
              const optValue = typeof opt === 'object' ? opt.value : opt
              const optLabel = typeof opt === 'object' ? opt.label : opt
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              )
            })}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            className="input min-h-[80px]"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 3}
          />
        )

      case 'json':
        return (
          <textarea
            className="input min-h-[100px] font-mono text-xs"
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder || 'Enter JSON...'}
            rows={field.rows || 5}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            className="input"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            step={field.step || 'any'}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            className="input"
            value={value ? value.split('T')[0] : ''}
            onChange={(e) => handleChange(field.key, e.target.value ? new Date(e.target.value).toISOString() : '')}
            required={field.required}
          />
        )

      case 'email':
        return (
          <input
            type="email"
            className="input"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
          />
        )

      default:
        return (
          <input
            type="text"
            className="input"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="label">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
