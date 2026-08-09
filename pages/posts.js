import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function PostsPage() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/posts')
    setItems(await res.json())
  }

  const fetchRefs = async () => {
    const [u, c] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
    setUsers(u)
    setCategories(c)
  }

  useEffect(() => { fetchItems(); fetchRefs() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/posts?id=${editingItem.id}` : '/api/posts'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    setSuccessMessage(editingItem ? 'Post updated successfully' : 'Post created successfully')
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
    await fetch(`/api/posts?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Post deleted successfully')
    fetchItems()
  }

  const userOptions = users.map(u => ({ value: u.id, label: u.name }))
  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'authorId', label: 'Author',
      render: (val) => {
        const user = users.find(u => u.id === val)
        return user ? user.name : '—'
      },
    },
    {
      key: 'status', label: 'Status',
      render: (val) => (
        <span className={`badge ${
          val === 'published' ? 'bg-emerald-50 text-emerald-700' :
          val === 'draft' ? 'bg-gray-100 text-gray-500' :
          'bg-amber-50 text-amber-700'
        }`}>{val}</span>
      ),
    },
    {
      key: 'publishedAt', label: 'Published',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
  ]

  const fields = [
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Post title' },
    { key: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Write your content here...', rows: 6 },
    { key: 'authorId', label: 'Author', type: 'select', options: userOptions },
    { key: 'categoryId', label: 'Category', type: 'select', options: categoryOptions },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
  ]

  return (
    <Layout>
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="posts"
        title="Posts"
        description="Manage blog posts and articles"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="posts" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Post' : 'Create Post'}
      />
    </Layout>
  )
}
