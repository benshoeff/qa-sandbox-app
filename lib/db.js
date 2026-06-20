import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function filePath(entity) {
  return path.join(DATA_DIR, `${entity}.json`)
}

const usePostgres = !!process.env.POSTGRES_URL
let _sql = null

async function getSql() {
  if (!_sql) {
    const mod = await import('@vercel/postgres')
    _sql = mod.sql
  }
  return _sql
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type)`
}

export async function getAll(entity) {
  if (usePostgres) {
    const sql = await getSql()
    await ensureTable(sql)
    const { rows } = await sql`
      SELECT data FROM entities
      WHERE type = ${entity}
      ORDER BY created_at ASC
    `
    return rows.map(r => r.data)
  }
  const raw = fs.readFileSync(filePath(entity), 'utf-8')
  return JSON.parse(raw)
}

export async function getById(entity, id) {
  if (usePostgres) {
    const sql = await getSql()
    await ensureTable(sql)
    const { rows } = await sql`
      SELECT data FROM entities
      WHERE type = ${entity} AND id = ${id}
      LIMIT 1
    `
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
    const sql = await getSql()
    await ensureTable(sql)
    await sql`
      INSERT INTO entities (id, type, data, created_at, updated_at)
      VALUES (${newItem.id}, ${entity}, ${JSON.stringify(newItem)}, ${newItem.createdAt}, ${newItem.updatedAt})
    `
    return newItem
  }

  const items = JSON.parse(fs.readFileSync(filePath(entity), 'utf-8'))
  items.push(newItem)
  fs.writeFileSync(filePath(entity), JSON.stringify(items, null, 2))
  return newItem
}

export async function update(entity, id, data) {
  if (usePostgres) {
    const sql = await getSql()
    await ensureTable(sql)
    const existing = await getById(entity, id)
    if (!existing) return null

    const updatedItem = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    await sql`
      UPDATE entities
      SET data = ${JSON.stringify(updatedItem)}::jsonb,
          updated_at = ${updatedItem.updatedAt}
      WHERE type = ${entity} AND id = ${id}
    `
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
    const sql = await getSql()
    await ensureTable(sql)
    const { rowCount } = await sql`
      DELETE FROM entities
      WHERE type = ${entity} AND id = ${id}
    `
    return rowCount > 0
  }

  const items = JSON.parse(fs.readFileSync(filePath(entity), 'utf-8'))
  const filtered = items.filter(item => item.id !== id)
  if (filtered.length === items.length) return false
  fs.writeFileSync(filePath(entity), JSON.stringify(filtered, null, 2))
  return true
}
