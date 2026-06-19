import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'

export default function PostsPage() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

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
    fetchItems()
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts?id=${item.id}`, { method: 'DELETE' })
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog posts and articles</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Post
        </button>
      </div>

      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

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
