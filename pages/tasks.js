import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'

export default function TasksPage() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/tasks')
    setItems(await res.json())
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    setUsers(await res.json())
  }

  useEffect(() => { fetchItems(); fetchUsers() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/tasks?id=${editingItem.id}` : '/api/tasks'
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
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks?id=${item.id}`, { method: 'DELETE' })
    fetchItems()
  }

  const userOptions = users.map(u => ({ value: u.id, label: u.name }))

  const columns = [
    { key: 'title', label: 'Title' },
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
      key: 'status', label: 'Status',
      render: (val) => {
        const map = { todo: 'bg-gray-100 text-gray-500', in_progress: 'bg-blue-50 text-blue-700', done: 'bg-emerald-50 text-emerald-700' }
        return <span className={`badge ${map[val] || map.todo}`}>{val.replace('_', ' ')}</span>
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
      key: 'dueDate', label: 'Due Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
  ]

  const fields = [
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Task title' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Task description' },
    { key: 'status', label: 'Status', type: 'select', options: ['todo', 'in_progress', 'done'] },
    { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
    { key: 'assigneeId', label: 'Assignee', type: 'select', options: userOptions },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
  ]

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Track project tasks and assignments</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      <DataTable columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Task' : 'Create Task'}
      />
    </Layout>
  )
}
