import { useEffect, useState } from 'react'
import { apiDashboardStats } from '@/lib/api'
import { formatCurrency, planColor, planLabel } from '@/lib/utils'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users, TicketCheck, DollarSign, Repeat2,
  TrendingUp, UserCheck, Crown, Flame,
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import type { DashboardStats } from '@/types'

const PLAN_COLORS = { free: '#6b7280', pro: '#3b82f6', premium: '#f59e0b' }

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <Card>
      <CardBody className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </CardBody>
    </Card>
  )
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiDashboardStats()
      .then(d => setStats(d.stats))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return (
    <div className="text-center py-16 text-gray-400">Erro ao carregar dados</div>
  )

  const planData = [
    { name: 'Free',    value: stats.free_users,    color: PLAN_COLORS.free    },
    { name: 'Pro',     value: stats.pro_users,     color: PLAN_COLORS.pro     },
    { name: 'Premium', value: stats.premium_users, color: PLAN_COLORS.premium },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Visão geral do MEX em tempo real</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total usuários"  value={stats.total_users}   sub={`+${stats.new_users_7d} últimos 7d`}  color="bg-blue-500/10 text-blue-500" />
        <StatCard icon={Crown}       label="Premium"         value={stats.premium_users} sub={`${stats.pro_users} Pro`}              color="bg-amber-500/10 text-amber-500" />
        <StatCard icon={DollarSign}  label="MRR estimado"    value={formatCurrency(stats.mrr_estimate)} sub="mensal"                color="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon={TicketCheck} label="Tickets abertos" value={stats.open_tickets}  sub={`${stats.total_tickets} total`}        color="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Planos breakdown */}
        <Card accent>
          <CardBody>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Distribuição de planos</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={planData} dataKey="value" innerRadius={28} outerRadius={46} paddingAngle={3}>
                    {planData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {planData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{d.value}</span>
                      <Badge className={planColor(d.name.toLowerCase())}>{planLabel(d.name.toLowerCase())}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick stats */}
        <Card accent className="lg:col-span-2">
          <CardBody>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Crescimento</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: TrendingUp,  label: 'Novos (7d)',  value: stats.new_users_7d,   color: 'text-blue-400' },
                { icon: UserCheck,   label: 'Novos (30d)', value: stats.new_users_30d,  color: 'text-emerald-400' },
                { icon: Repeat2,     label: 'Exchanges',   value: stats.active_exchanges, color: 'text-purple-400' },
                { icon: Flame,       label: 'Tickets',     value: stats.total_tickets,  color: 'text-amber-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/3">
                  <Icon size={16} className={color} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
