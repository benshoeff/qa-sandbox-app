import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'

export default function UsersPage() {
  const [items, setItems] = useState([])
  const [roles, setRoles] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/users')
    setItems(await res.json())
  }

  const fetchRoles = async () => {
    const res = await fetch('/api/roles')
    setRoles(await res.json())
  }

  useEffect(() => { fetchItems(); fetchRoles() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/users?id=${editingItem.id}` : '/api/users'
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
    if (!confirm('Delete this user?')) return
    await fetch(`/api/users?id=${item.id}`, { method: 'DELETE' })
    fetchItems()
  }

  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }))

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'roleId', label: 'Role',
      render: (val) => {
        const role = roles.find(r => r.id === val)
        return role ? <span className="badge bg-purple-50 text-purple-700">{role.name}</span> : '—'
      },
    },
    {
      key: 'status', label: 'Status',
      render: (val) => (
        <span className={`badge ${val === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {val}
        </span>
      ),
    },
  ]

  const fields = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'email@example.com' },
    { key: 'roleId', label: 'Role', type: 'select', options: roleOptions },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
  ]

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system users</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit User' : 'Create User'}
      />
    </Layout>
  )
}
