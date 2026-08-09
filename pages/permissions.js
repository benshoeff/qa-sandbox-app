import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function PermissionsPage() {
  const [items, setItems] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

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
    setSuccessMessage(editingItem ? 'Permission updated successfully' : 'Permission created successfully')
    fetchItems()
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDelete = (item) => {
    setDeleteConfirm(item)
  }

  const handleDeleteConfirm = async () => {
    await fetch(`/api/permissions?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Permission deleted successfully')
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
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Permission"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="permissions"
        title="Permissions"
        description="Manage access permissions"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="permissions" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

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
