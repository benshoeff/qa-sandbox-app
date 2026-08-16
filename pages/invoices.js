import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function InvoicesPage() {
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/invoices')
    setItems(await res.json())
  }

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers')
    setCustomers(await res.json())
  }

  useEffect(() => { fetchItems(); fetchCustomers() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/invoices?id=${editingItem.id}` : '/api/invoices'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    setSuccessMessage(editingItem ? 'Invoice updated successfully' : 'Invoice created successfully')
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
    await fetch(`/api/invoices?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Invoice deleted successfully')
    fetchItems()
  }

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }))

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    {
      key: 'customerId', label: 'Customer',
      render: (val) => {
        const customer = customers.find(c => c.id === val)
        return customer ? customer.name : '—'
      },
    },
    {
      key: 'issueDate', label: 'Issue Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'dueDate', label: 'Due Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'totalAmount', label: 'Total',
      render: (val) => <span className="font-semibold">${Number(val).toFixed(2)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const colors = {
          draft: 'bg-gray-100 text-gray-500',
          sent: 'bg-blue-50 text-blue-700',
          paid: 'bg-emerald-50 text-emerald-700',
          overdue: 'bg-red-50 text-red-700',
          cancelled: 'bg-amber-50 text-amber-700',
        }
        return <span className={`badge ${colors[val] || 'bg-gray-100 text-gray-500'}`}>{val}</span>
      },
    },
  ]

  const fields = [
    { key: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true, placeholder: 'e.g. INV-2025-001' },
    { key: 'customerId', label: 'Customer', type: 'select', required: true, options: customerOptions },
    { key: 'issueDate', label: 'Issue Date', type: 'date' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'totalAmount', label: 'Total Amount ($)', type: 'number', placeholder: '0.00', step: '0.01' },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] },
  ]

  return (
    <Layout>
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${deleteConfirm?.invoiceNumber}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="invoices"
        title="Invoices"
        description="Manage customer invoices and payments"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="invoices" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Invoice' : 'Create Invoice'}
      />
    </Layout>
  )
}
