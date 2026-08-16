import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function ReviewsPage() {
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/reviews')
    setItems(await res.json())
  }

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    setProducts(await res.json())
  }

  useEffect(() => { fetchItems(); fetchProducts() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/reviews?id=${editingItem.id}` : '/api/reviews'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    setSuccessMessage(editingItem ? 'Review updated successfully' : 'Review created successfully')
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
    await fetch(`/api/reviews?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Review deleted successfully')
    fetchItems()
  }

  const productOptions = products.map(p => ({ value: p.id, label: p.name }))

  const columns = [
    {
      key: 'productId', label: 'Product',
      render: (val) => {
        const product = products.find(p => p.id === val)
        return product ? product.name : '—'
      },
    },
    { key: 'author', label: 'Author' },
    {
      key: 'rating', label: 'Rating',
      render: (val) => {
        const n = Number(val)
        return (
          <span className="text-amber-500 font-semibold">{'★'.repeat(n)}<span className="text-gray-300">{'★'.repeat(5 - n)}</span></span>
        )
      },
    },
    {
      key: 'comment', label: 'Comment',
      render: (val) => val ? (val.length > 60 ? `${val.slice(0, 60)}...` : val) : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const colors = {
          pending: 'bg-amber-50 text-amber-700',
          approved: 'bg-emerald-50 text-emerald-700',
          rejected: 'bg-red-50 text-red-700',
        }
        return <span className={`badge ${colors[val] || 'bg-gray-100 text-gray-500'}`}>{val}</span>
      },
    },
  ]

  const fields = [
    { key: 'productId', label: 'Product', type: 'select', required: true, options: productOptions },
    { key: 'author', label: 'Author', type: 'text', placeholder: 'Reviewer name' },
    { key: 'rating', label: 'Rating (1-5)', type: 'number', required: true, placeholder: '5', min: '1', max: '5', step: '1' },
    { key: 'comment', label: 'Comment', type: 'textarea', placeholder: 'Review comment' },
    { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
  ]

  return (
    <Layout>
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Review"
        message={`Are you sure you want to delete this review? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="reviews"
        title="Reviews"
        description="Moderate product reviews and ratings"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="reviews" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Review' : 'Create Review'}
      />
    </Layout>
  )
}
