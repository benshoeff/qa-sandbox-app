import { getAll, getById, create, update, remove } from '@/lib/db'

export default function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = getById('permissions', id)
        if (!item) return res.status(404).json({ error: 'Permission not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(getAll('permissions'))

    case 'POST':
      const { name, resource, action, description } = req.body
      if (!name || !resource || !action) {
        return res.status(400).json({ error: 'Name, resource, and action are required' })
      }
      const created = create('permissions', { name, resource, action, description: description || '' })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const updated = update('permissions', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Permission not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = remove('permissions', id)
      if (!deleted) return res.status(404).json({ error: 'Permission not found' })
      return res.status(200).json({ message: 'Permission deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
