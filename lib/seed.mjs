import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '..', 'data')
const ENTITIES = ['users', 'roles', 'permissions', 'products', 'categories', 'posts', 'tasks', 'orders']

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
})

async function query(text, params) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

async function seed() {
  console.log('Creating table...')
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

  for (const entity of ENTITIES) {
    const filePath = path.join(DATA_DIR, `${entity}.json`)
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${entity}: file not found`)
      continue
    }
    const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    if (items.length === 0) continue

    console.log(`Seeding ${entity} (${items.length} items)...`)
    for (const item of items) {
      try {
        await query(
          'INSERT INTO entities (id, type, data, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [item.id, entity, JSON.stringify(item), item.createdAt, item.updatedAt]
        )
      } catch (err) {
        console.error(`  Failed to insert ${item.id}:`, err.message)
      }
    }
  }

  console.log('Done!')
  await pool.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
