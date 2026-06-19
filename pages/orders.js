import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'

export default function OrdersPage() {
  const [items, setItems] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

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
    fetchItems()
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this order?')) return
    await fetch(`/api/orders?id=${item.id}`, { method: 'DELETE' })
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Order
        </button>
      </div>

      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

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
