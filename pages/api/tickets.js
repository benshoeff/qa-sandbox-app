import { getAll, getById, create, update, remove } from '@/lib/db'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = await getById('tickets', id)
        if (!item) return res.status(404).json({ error: 'Ticket not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(await getAll('tickets'))

    case 'POST':
      const { subject, description, customerId, assigneeId, priority, status } = req.body
      if (!subject || !customerId) {
        return res.status(400).json({ error: 'Subject and customer are required' })
      }
      const created = await create('tickets', {
        subject,
        description: description || '',
        customerId,
        assigneeId: assigneeId || null,
        priority: priority || 'medium',
        status: status || 'open',
      })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const updated = await update('tickets', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Ticket not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = await remove('tickets', id)
      if (!deleted) return res.status(404).json({ error: 'Ticket not found' })
      return res.status(200).json({ message: 'Ticket deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
