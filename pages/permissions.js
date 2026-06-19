import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'

export default function PermissionsPage() {
  const [items, setItems] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/permissions')
    setItems(await res.json())
  }

  useEffect(() => { fetchItems() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/permissions?id=${editingItem.id}` : '/api/permissions'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    fetchItems()
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this permission?')) return
    await fetch(`/api/permissions?id=${item.id}`, { method: 'DELETE' })
    fetchItems()
  }

  const columns = [
    { key: 'name', label: 'Permission' },
    { key: 'resource', label: 'Resource' },
    {
      key: 'action', label: 'Action',
      render: (val) => (
        <span className={`badge ${
          val === 'manage' ? 'bg-red-50 text-red-700' :
          val === 'create' ? 'bg-emerald-50 text-emerald-700' :
          val === 'read' ? 'bg-blue-50 text-blue-700' :
          val === 'update' ? 'bg-amber-50 text-amber-700' :
          'bg-gray-100 text-gray-700'
        }`}>{val}</span>
      ),
    },
    { key: 'description', label: 'Description' },
  ]

  const fields = [
    { key: 'name', label: 'Permission Name', type: 'text', required: true, placeholder: 'e.g. Create Users' },
    { key: 'resource', label: 'Resource', type: 'text', required: true, placeholder: 'e.g. users, reports' },
    { key: 'action', label: 'Action', type: 'select', required: true, options: ['create', 'read', 'update', 'delete', 'manage'] },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this permission...' },
  ]

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage access permissions</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Permission
        </button>
      </div>

      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Permission' : 'Create Permission'}
      />
    </Layout>
  )
}
