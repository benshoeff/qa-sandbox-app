import { getAll, getById, create, update, remove } from '@/lib/db'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = await getById('tasks', id)
        if (!item) return res.status(404).json({ error: 'Task not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(await getAll('tasks'))

    case 'POST':
      const { title, description, status, priority, assigneeId, dueDate } = req.body
      if (!title) return res.status(400).json({ error: 'Title is required' })
      const created = await create('tasks', {
        title,
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
      })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const updated = await update('tasks', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Task not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = await remove('tasks', id)
      if (!deleted) return res.status(404).json({ error: 'Task not found' })
      return res.status(200).json({ message: 'Task deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
