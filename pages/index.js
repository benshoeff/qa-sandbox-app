import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'

const entities = [
  { name: 'Users', href: '/users', icon: '👥', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Roles', href: '/roles', icon: '🛡️', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Permissions', href: '/permissions', icon: '🔐', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Products', href: '/products', icon: '📦', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Categories', href: '/categories', icon: '📂', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Posts', href: '/posts', icon: '📝', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Tasks', href: '/tasks', icon: '✅', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Orders', href: '/orders', icon: '🛒', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]

export default function Dashboard() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    async function fetchAll() {
      const results = {}
      for (const entity of entities) {
        try {
          const res = await fetch(`/api/${entity.name.toLowerCase()}`)
          const data = await res.json()
          results[entity.name.toLowerCase()] = Array.isArray(data) ? data.length : 0
        } catch {
          results[entity.name.toLowerCase()] = 0
        }
      }
      setCounts(results)
    }
    fetchAll()
  }, [])

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to QA Sandbox — your testing platform. Use the sidebar to navigate between entities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {entities.map((entity) => {
          const key = entity.name.toLowerCase()
          const count = counts[key] ?? '...'
          return (
            <Link
              key={key}
              href={entity.href}
              className={`card px-5 py-4 border-2 hover:shadow-md transition-all ${entity.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{entity.name}</p>
                  <p className="text-3xl font-bold mt-1">{count}</p>
                </div>
                <span className="text-3xl opacity-70">{entity.icon}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints Reference</h2>
        <div className="space-y-2 text-sm">
          {entities.map((entity) => {
            const key = entity.name.toLowerCase()
            return (
              <div key={key} className="flex items-center gap-3 text-gray-600">
                <code className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono text-gray-800">
                  /api/{key}
                </code>
                <span className="text-gray-400">—</span>
                <span>GET, POST, PUT, DELETE CRUD for {entity.name.toLowerCase()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
