import { getAll, getById, create, update, remove } from '@/lib/db'

export default async function handler(req, res) {
  const { method, query: { id } } = req

  switch (method) {
    case 'GET':
      if (id) {
        const item = await getById('invoices', id)
        if (!item) return res.status(404).json({ error: 'Invoice not found' })
        return res.status(200).json(item)
      }
      return res.status(200).json(await getAll('invoices'))

    case 'POST':
      const { invoiceNumber, customerId, issueDate, dueDate, totalAmount, status } = req.body
      if (!invoiceNumber || !customerId) {
        return res.status(400).json({ error: 'Invoice number and customer are required' })
      }
      const created = await create('invoices', {
        invoiceNumber,
        customerId,
        issueDate: issueDate || null,
        dueDate: dueDate || null,
        totalAmount: Number(totalAmount) || 0,
        status: status || 'draft',
      })
      return res.status(201).json(created)

    case 'PUT':
      if (!id) return res.status(400).json({ error: 'id is required' })
      if (req.body.totalAmount !== undefined) req.body.totalAmount = Number(req.body.totalAmount)
      const updated = await update('invoices', id, req.body)
      if (!updated) return res.status(404).json({ error: 'Invoice not found' })
      return res.status(200).json(updated)

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'id is required' })
      const deleted = await remove('invoices', id)
      if (!deleted) return res.status(404).json({ error: 'Invoice not found' })
      return res.status(200).json({ message: 'Invoice deleted successfully' })

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
