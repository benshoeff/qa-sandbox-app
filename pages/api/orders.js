import { getAll, getById, create, update, remove } from '@/lib/db'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = await getById('orders', id)
        if (!item) return res.status(404).json({ error: 'Order not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(await getAll('orders'))

    case 'POST':
      const { customerName, email, items, totalAmount, status } = req.body
      if (!customerName || !email) {
        return res.status(400).json({ error: 'Customer name and email are required' })
      }
      const calculatedTotal = items
        ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        : totalAmount || 0
      const created = await create('orders', {
        customerName,
        email,
        items: items || [],
        totalAmount: totalAmount || calculatedTotal,
        status: status || 'pending',
      })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      if (req.body.items) {
        req.body.totalAmount = req.body.items.reduce(
          (sum, item) => sum + item.price * item.quantity, 0
        )
      }
      const updated = await update('orders', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Order not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = await remove('orders', id)
      if (!deleted) return res.status(404).json({ error: 'Order not found' })
      return res.status(200).json({ message: 'Order deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
