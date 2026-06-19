import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'

export default function ProductsPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/products')
    setItems(await res.json())
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    setCategories(await res.json())
  }

  useEffect(() => { fetchItems(); fetchCategories() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/products?id=${editingItem.id}` : '/api/products'
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
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products?id=${item.id}`, { method: 'DELETE' })
    fetchItems()
  }

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'price', label: 'Price',
      render: (val) => `$${Number(val).toFixed(2)}`,
    },
    {
      key: 'categoryId', label: 'Category',
      render: (val) => {
        const cat = categories.find(c => c.id === val)
        return cat ? cat.name : '—'
      },
    },
    {
      key: 'status', label: 'Status',
      render: (val) => (
        <span className={`badge ${
          val === 'active' ? 'bg-emerald-50 text-emerald-700' :
          val === 'discontinued' ? 'bg-red-50 text-red-700' :
          'bg-gray-100 text-gray-500'
        }`}>{val}</span>
      ),
    },
  ]

  const fields = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Product name' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Product description' },
    { key: 'price', label: 'Price ($)', type: 'number', required: true, placeholder: '0.00', step: '0.01' },
    { key: 'categoryId', label: 'Category', type: 'select', options: categoryOptions },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'discontinued'] },
  ]

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product catalog</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Product' : 'Create Product'}
      />
    </Layout>
  )
}
