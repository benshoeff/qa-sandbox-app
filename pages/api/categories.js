import { getAll, getById, create, update, remove } from '@/lib/db'

export default function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = getById('categories', id)
        if (!item) return res.status(404).json({ error: 'Category not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(getAll('categories'))

    case 'POST':
      const { name, description } = req.body
      if (!name) return res.status(400).json({ error: 'Name is required' })
      const created = create('categories', { name, description: description || '' })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const updated = update('categories', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Category not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = remove('categories', id)
      if (!deleted) return res.status(404).json({ error: 'Category not found' })
      return res.status(200).json({ message: 'Category deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
