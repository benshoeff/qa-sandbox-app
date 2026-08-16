import { getAll, getById, create, update, remove } from '@/lib/db'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = await getById('projects', id)
        if (!item) return res.status(404).json({ error: 'Project not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(await getAll('projects'))

    case 'POST':
      const { name, description, ownerId, status, priority, startDate, endDate } = req.body
      if (!name || !ownerId) {
        return res.status(400).json({ error: 'Name and owner are required' })
      }
      const created = await create('projects', {
        name,
        description: description || '',
        ownerId,
        status: status || 'planned',
        priority: priority || 'medium',
        startDate: startDate || null,
        endDate: endDate || null,
      })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const updated = await update('projects', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Project not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = await remove('projects', id)
      if (!deleted) return res.status(404).json({ error: 'Project not found' })
      return res.status(200).json({ message: 'Project deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
