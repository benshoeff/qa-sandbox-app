import { getAll, getById, create, update, remove } from '@/lib/db'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = await getById('posts', id)
        if (!item) return res.status(404).json({ error: 'Post not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(await getAll('posts'))

    case 'POST':
      const { title, content, authorId, categoryId, status } = req.body
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
      }
      const created = await create('posts', {
        title,
        content,
        authorId: authorId || null,
        categoryId: categoryId || null,
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date().toISOString() : null,
      })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      if (req.body.status === 'published' && !req.body.publishedAt) {
        req.body.publishedAt = new Date().toISOString()
      }
      const updated = await update('posts', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Post not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = await remove('posts', id)
      if (!deleted) return res.status(404).json({ error: 'Post not found' })
      return res.status(200).json({ message: 'Post deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
