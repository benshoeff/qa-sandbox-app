import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import FormModal from '@/components/FormModal'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import PageHeader from '@/components/PageHeader'

export default function EmployeesPage() {
  const [items, setItems] = useState([])
  const [departments, setDepartments] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchItems = async () => {
    const res = await fetch('/api/employees')
    setItems(await res.json())
  }

  const fetchDepartments = async () => {
    const res = await fetch('/api/departments')
    setDepartments(await res.json())
  }

  useEffect(() => { fetchItems(); fetchDepartments() }, [])

  const handleSubmit = async (data) => {
    const url = editingItem ? `/api/employees?id=${editingItem.id}` : '/api/employees'
    const method = editingItem ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setModalOpen(false)
    setEditingItem(null)
    setSuccessMessage(editingItem ? 'Employee updated successfully' : 'Employee created successfully')
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
    await fetch(`/api/employees?id=${deleteConfirm.id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    setSuccessMessage('Employee deleted successfully')
    fetchItems()
  }

  const departmentOptions = departments.map(d => ({ value: d.id, label: d.name }))

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'departmentId', label: 'Department',
      render: (val) => {
        const dept = departments.find(d => d.id === val)
        return dept ? <span className="badge bg-cyan-50 text-cyan-700">{dept.name}</span> : '—'
      },
    },
    { key: 'position', label: 'Position' },
    {
      key: 'salary', label: 'Salary',
      render: (val) => val ? `$${Number(val).toLocaleString()}` : '—',
    },
    {
      key: 'hireDate', label: 'Hire Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const colors = {
          active: 'bg-emerald-50 text-emerald-700',
          on_leave: 'bg-amber-50 text-amber-700',
          terminated: 'bg-red-50 text-red-700',
        }
        return <span className={`badge ${colors[val] || 'bg-gray-100 text-gray-500'}`}>{val.replace('_', ' ')}</span>
      },
    },
  ]

  const fields = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'employee@example.com' },
    { key: 'departmentId', label: 'Department', type: 'select', options: departmentOptions },
    { key: 'position', label: 'Position', type: 'text', placeholder: 'e.g. QA Engineer' },
    { key: 'salary', label: 'Salary ($)', type: 'number', placeholder: '0', step: '1000' },
    { key: 'hireDate', label: 'Hire Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'on_leave', 'terminated'] },
  ]

  return (
    <Layout>
      <Toast data-testid={successMessage ? 'success-toast' : undefined} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <PageHeader
        entity="employees"
        title="Employees"
        description="Manage employees and departments"
        onAdd={() => { setEditingItem(null); setModalOpen(true) }}
      />

      <DataTable entity="employees" columns={columns} data={items} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSubmit}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Employee' : 'Create Employee'}
      />
    </Layout>
  )
}
