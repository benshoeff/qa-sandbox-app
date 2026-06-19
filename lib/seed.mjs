import { sql } from '@vercel/postgres'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ENTITIES = ['users', 'roles', 'permissions', 'products', 'categories', 'posts', 'tasks', 'orders']

async function seed() {
  console.log('Creating table...')
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
      await sql`
        INSERT INTO entities (id, type, data, created_at, updated_at)
        VALUES (${item.id}, ${entity}, ${JSON.stringify(item)}, ${item.createdAt}, ${item.updatedAt})
        ON CONFLICT (id) DO NOTHING
      `
    }
  }

  console.log('Done!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
