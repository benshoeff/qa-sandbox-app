import { getAll, getById, create, update, remove } from '@/lib/db'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = await getById('users', id)
        if (!item) return res.status(404).json({ error: 'User not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(await getAll('users'))

    case 'POST':
      const { name, email, roleId, status } = req.body
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' })
      }
      const created = await create('users', { name, email, roleId: roleId || null, status: status || 'active' })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const updated = await update('users', id, req.body)
      if (!updated) return res.status(404).json({ error: 'User not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = await remove('users', id)
      if (!deleted) return res.status(404).json({ error: 'User not found' })
      return res.status(200).json({ message: 'User deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
