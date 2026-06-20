import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

const DATA_DIR = path.join(process.cwd(), 'data')

function filePath(entity) {
  return path.join(DATA_DIR, `${entity}.json`)
}

const usePostgres = !!process.env.POSTGRES_URL

let pool

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    })
  }
  return pool
}

async function query(text, params) {
  const client = await getPool().connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

let tableEnsured = false

async function ensureTable() {
  if (tableEnsured) return
  await query(
    `CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  )
  await query('CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type)')
  tableEnsured = true
}

export async function getAll(entity) {
  if (usePostgres) {
    await ensureTable()
    const { rows } = await query(
      'SELECT data FROM entities WHERE type = $1 ORDER BY created_at ASC',
      [entity]
    )
    return rows.map(r => r.data)
  }
  const raw = fs.readFileSync(filePath(entity), 'utf-8')
  return JSON.parse(raw)
}

export async function getById(entity, id) {
  if (usePostgres) {
    await ensureTable()
    const { rows } = await query(
      'SELECT data FROM entities WHERE type = $1 AND id = $2 LIMIT 1',
      [entity, id]
    )
    return rows.length > 0 ? rows[0].data : null
  }
  const items = JSON.parse(fs.readFileSync(filePath(entity), 'utf-8'))
  return items.find(item => item.id === id) || null
}

export async function create(entity, data) {
  const newItem = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (usePostgres) {
    await ensureTable()
    await query(
      'INSERT INTO entities (id, type, data, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
      [newItem.id, entity, JSON.stringify(newItem), newItem.createdAt, newItem.updatedAt]
    )
    return newItem
  }

  const items = JSON.parse(fs.readFileSync(filePath(entity), 'utf-8'))
  items.push(newItem)
  fs.writeFileSync(filePath(entity), JSON.stringify(items, null, 2))
  return newItem
}

export async function update(entity, id, data) {
  if (usePostgres) {
    await ensureTable()
    const existing = await getById(entity, id)
    if (!existing) return null

    const updatedItem = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    await query(
      'UPDATE entities SET data = $1::jsonb, updated_at = $2 WHERE type = $3 AND id = $4',
      [JSON.stringify(updatedItem), updatedItem.updatedAt, entity, id]
    )
    return updatedItem
  }

  const items = JSON.parse(fs.readFileSync(filePath(entity), 'utf-8'))
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

export async function remove(entity, id) {
  if (usePostgres) {
    await ensureTable()
    const { rowCount } = await query(
      'DELETE FROM entities WHERE type = $1 AND id = $2',
      [entity, id]
    )
    return rowCount > 0
  }

  const items = JSON.parse(fs.readFileSync(filePath(entity), 'utf-8'))
  const filtered = items.filter(item => item.id !== id)
  if (filtered.length === items.length) return false
  fs.writeFileSync(filePath(entity), JSON.stringify(filtered, null, 2))
  return true
}
