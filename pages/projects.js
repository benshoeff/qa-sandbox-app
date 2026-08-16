import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function ProjectsPage() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/projects')
    setItems(await res.json())
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    setUsers(await res.json())
  }

  useEffect(() => { fetchItems(); fetchUsers() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/projects?id=${editingItem.id}` : '/api/projects'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    setSuccessMessage(editingItem ? 'Project updated successfully' : 'Project created successfully')
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
    await fetch(`/api/projects?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Project deleted successfully')
    fetchItems()
  }

  const userOptions = users.map(u => ({ value: u.id, label: u.name }))

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'ownerId', label: 'Owner',
      render: (val) => {
        const user = users.find(u => u.id === val)
        return user ? user.name : '—'
      },
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const colors = {
          planned: 'bg-gray-100 text-gray-500',
          in_progress: 'bg-blue-50 text-blue-700',
          on_hold: 'bg-amber-50 text-amber-700',
          completed: 'bg-emerald-50 text-emerald-700',
        }
        return <span className={`badge ${colors[val] || 'bg-gray-100 text-gray-500'}`}>{val.replace('_', ' ')}</span>
      },
    },
    {
      key: 'priority', label: 'Priority',
      render: (val) => (
        <span className={`badge ${
          val === 'high' ? 'bg-red-50 text-red-700' :
          val === 'medium' ? 'bg-amber-50 text-amber-700' :
          'bg-gray-100 text-gray-500'
        }`}>{val}</span>
      ),
    },
    {
      key: 'startDate', label: 'Start Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'endDate', label: 'End Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
  ]

  const fields = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Project name' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Project description' },
    { key: 'ownerId', label: 'Owner', type: 'select', required: true, options: userOptions },
    { key: 'status', label: 'Status', type: 'select', options: ['planned', 'in_progress', 'on_hold', 'completed'] },
    { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
  ]

  return (
    <Layout>
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="projects"
        title="Projects"
        description="Track project timelines and ownership"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="projects" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Project' : 'Create Project'}
      />
    </Layout>
  )
}
