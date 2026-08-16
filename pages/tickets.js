import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function TicketsPage() {
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/tickets')
    setItems(await res.json())
  }

  const fetchRefs = async () => {
    const [c, u] = await Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ])
    setCustomers(c)
    setUsers(u)
  }

  useEffect(() => { fetchItems(); fetchRefs() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/tickets?id=${editingItem.id}` : '/api/tickets'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    setSuccessMessage(editingItem ? 'Ticket updated successfully' : 'Ticket created successfully')
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
    await fetch(`/api/tickets?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Ticket deleted successfully')
    fetchItems()
  }

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }))
  const userOptions = users.map(u => ({ value: u.id, label: u.name }))

  const columns = [
    { key: 'subject', label: 'Subject' },
    {
      key: 'customerId', label: 'Customer',
      render: (val) => {
        const customer = customers.find(c => c.id === val)
        return customer ? customer.name : '—'
      },
    },
    {
      key: 'assigneeId', label: 'Assignee',
      render: (val) => {
        const user = users.find(u => u.id === val)
        return user ? user.name : '—'
      },
    },
    {
      key: 'priority', label: 'Priority',
      render: (val) => {
        const colors = {
          low: 'bg-gray-100 text-gray-500',
          medium: 'bg-blue-50 text-blue-700',
          high: 'bg-amber-50 text-amber-700',
          critical: 'bg-red-50 text-red-700',
        }
        return <span className={`badge ${colors[val] || 'bg-gray-100 text-gray-500'}`}>{val}</span>
      },
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const colors = {
          open: 'bg-red-50 text-red-700',
          in_progress: 'bg-blue-50 text-blue-700',
          resolved: 'bg-emerald-50 text-emerald-700',
          closed: 'bg-gray-100 text-gray-500',
        }
        return <span className={`badge ${colors[val] || 'bg-gray-100 text-gray-500'}`}>{val.replace('_', ' ')}</span>
      },
    },
  ]

  const fields = [
    { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Ticket subject' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the issue...' },
    { key: 'customerId', label: 'Customer', type: 'select', required: true, options: customerOptions },
    { key: 'assigneeId', label: 'Assignee', type: 'select', options: userOptions },
    { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
    { key: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'resolved', 'closed'] },
  ]

  return (
    <Layout>
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Ticket"
        message={`Are you sure you want to delete "${deleteConfirm?.subject}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="tickets"
        title="Tickets"
        description="Manage support tickets"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="tickets" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Ticket' : 'Create Ticket'}
      />
    </Layout>
  )
}
