export default function PageHeader({ entity, title, description, onAdd }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 data-testid="page-title" className="text-2xl font-bold text-gray-900">{title}</h1>
        <p data-testid="page-description" className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button data-testid={`add-${entity}-button`} className="btn-primary" onClick={onAdd}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add {title}
      </button>
    </div>
  )
}
