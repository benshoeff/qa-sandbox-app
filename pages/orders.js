import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function OrdersPage() {
  const [items, setItems] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/orders')
    setItems(await res.json())
  }

  useEffect(() => { fetchItems() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/orders?id=${editingItem.id}` : '/api/orders'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    setSuccessMessage(editingItem ? 'Order updated successfully' : 'Order created successfully')
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
    await fetch(`/api/orders?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Order deleted successfully')
    fetchItems()
  }

  const columns = [
    {
      key: 'id', label: 'Order',
      render: (val) => <span className="font-mono text-xs">#{val.slice(0, 8)}</span>,
    },
    { key: 'customerName', label: 'Customer' },
    { key: 'email', label: 'Email' },
    {
      key: 'items', label: 'Items',
      render: (val) => Array.isArray(val) ? val.reduce((sum, i) => sum + i.quantity, 0) : 0,
    },
    {
      key: 'totalAmount', label: 'Total',
      render: (val) => <span className="font-semibold">${Number(val).toFixed(2)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const colors = {
          pending: 'bg-amber-50 text-amber-700',
          processing: 'bg-blue-50 text-blue-700',
          shipped: 'bg-purple-50 text-purple-700',
          delivered: 'bg-emerald-50 text-emerald-700',
          cancelled: 'bg-red-50 text-red-700',
        }
        return <span className={`badge ${colors[val] || 'bg-gray-100 text-gray-500'}`}>{val}</span>
      },
    },
  ]

  const fields = [
    { key: 'customerName', label: 'Customer Name', type: 'text', required: true, placeholder: 'Full name' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'customer@example.com' },
    {
      key: 'items',
      label: 'Items (JSON)',
      type: 'json',
      placeholder: '[{"productId": "pr1", "quantity": 1, "price": 149.99}]',
    },
    { key: 'totalAmount', label: 'Total Amount ($)', type: 'number', placeholder: '0.00', step: '0.01' },
    { key: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
  ]

  return (
    <Layout>
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete order #${deleteConfirm?.id?.slice(0, 8)}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="orders"
        title="Orders"
        description="Manage customer orders"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="orders" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Order' : 'Create Order'}
      />
    </Layout>
  )
}
