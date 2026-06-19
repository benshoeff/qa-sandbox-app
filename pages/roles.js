import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'

export default function RolesPage() {
  const [items, setItems] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/roles')
    setItems(await res.json())
  }

  useEffect(() => { fetchItems() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/roles?id=${editingItem.id}` : '/api/roles'
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
    if (!confirm('Delete this role?')) return
    await fetch(`/api/roles?id=${item.id}`, { method: 'DELETE' })
    fetchItems()
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
  ]

  const fields = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Editor' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this role...' },
  ]

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500 mt-1">Define user roles and access levels</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Role
        </button>
      </div>

      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Role' : 'Create Role'}
      />
    </Layout>
  )
}
