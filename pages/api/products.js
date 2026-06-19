import { getAll, getById, create, update, remove } from '@/lib/db'

export default function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = getById('products', id)
        if (!item) return res.status(404).json({ error: 'Product not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(getAll('products'))

    case 'POST':
      const { name, description, price, categoryId, status } = req.body
      if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required' })
      }
      const created = create('products', {
        name,
        description: description || '',
        price: Number(price),
        categoryId: categoryId || null,
        status: status || 'active',
      })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      if (req.body.price !== undefined) req.body.price = Number(req.body.price)
      const updated = update('products', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Product not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = remove('products', id)
      if (!deleted) return res.status(404).json({ error: 'Product not found' })
      return res.status(200).json({ message: 'Product deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
