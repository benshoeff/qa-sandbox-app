import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function filePath(entity) {
  return path.join(DATA_DIR, `${entity}.json`)
}

export function getAll(entity) {
  const raw = fs.readFileSync(filePath(entity), 'utf-8')
  return JSON.parse(raw)
}

export function getById(entity, id) {
  const items = getAll(entity)
  return items.find(item => item.id === id) || null
}

export function create(entity, data) {
  const items = getAll(entity)
  const newItem = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  items.push(newItem)
  fs.writeFileSync(filePath(entity), JSON.stringify(items, null, 2))
  return newItem
}

export function update(entity, id, data) {
  const items = getAll(entity)
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return null
  items[index] = {
    ...items[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(filePath(entity), JSON.stringify(items, null, 2))
  return items[index]
}

export function remove(entity, id) {
  const items = getAll(entity)
  const filtered = items.filter(item => item.id !== id)
  if (filtered.length === items.length) return false
  fs.writeFileSync(filePath(entity), JSON.stringify(filtered, null, 2))
  return true
}
