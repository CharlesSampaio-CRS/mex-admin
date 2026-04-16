import { useEffect, useState } from 'react'
import { apiAdminExchangeStats } from '@/lib/api'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ExchangeStats } from '@/types'

const COLORS = ['#7c6af7','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899']

export function ExchangesPage() {
  const [data, setData] = useState<ExchangeStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiAdminExchangeStats()
      .then(d => setData(d.exchanges))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exchanges</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Exchanges mais conectadas pelos usuários</p>
      </div>

      <Card accent>
        <CardBody>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Usuários por exchange</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} width={70} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid #2e2e3e', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#f0f0f5' }}
              />
              <Bar dataKey="user_count" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map((e, i) => (
          <Card key={e.exchange_id}>
            <CardBody className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: COLORS[i % COLORS.length] }}>
                {e.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{e.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{e.user_count} usuários</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
