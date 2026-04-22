import { useEffect, useState } from 'react'
import { apiDashboardStats } from '@/lib/api'
import { formatCurrency, planColor, planLabel } from '@/lib/utils'
import { cacheGet, cacheSet } from '@/lib/cache'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import { SkeletonStatCard, SkeletonMiniCard, SkeletonChart } from '@/components/ui/Skeleton'
import {
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import type { DashboardStats } from '@/types'

const PLAN_COLORS = { free: '#6b7280', pro: '#3b82f6', premium: '#f59e0b' }

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <Card>
      <CardBody className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <IonIcon name={icon} size={18} />
        </div>
        <div>
          <p className="text-xs text-muted-fore mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-fore mt-0.5">{sub}</p>}
        </div>
      </CardBody>
    </Card>
  )
}

export function DashboardPage() {
  // 🚀 Lê do cache ANTES de montar — no F5 o conteúdo aparece instantâneo (stale-while-revalidate).
  const [stats, setStats] = useState<DashboardStats | null>(() => cacheGet<DashboardStats>('dashboard'))
  const [loading, setLoading] = useState(!stats)

  const load = () => {
    setLoading(true)
    return apiDashboardStats()
      .then(d => {
        setStats(d.stats)
        cacheSet('dashboard', d.stats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading && !stats) return (
    <div className="space-y-6 overflow-y-auto flex-1 min-h-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkeletonChart height={120} />
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonMiniCard key={i} />)}
          </div>
        </div>
      </div>
      <SkeletonChart height={140} />
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
    <div className="space-y-6 overflow-y-auto flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          <IonIcon name="refresh-outline" size={14} /> Atualizar
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="people-outline"          label="Total usuários"  value={stats.total_users}   sub={`+${stats.new_users_7d} últimos 7d`}  color="bg-blue-500/10 text-blue-500" />
        <StatCard icon="ribbon-outline"           label="Premium"         value={stats.premium_users} sub={`${stats.pro_users} Pro`}              color="bg-amber-500/10 text-amber-500" />
        <StatCard icon="cash-outline"             label="MRR estimado"    value={formatCurrency(stats.mrr_estimate)} sub="mensal"                color="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon="ticket-outline"           label="Tickets abertos" value={stats.open_tickets}  sub={`${stats.in_progress_tickets ?? 0} em andamento`} color="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Planos breakdown */}
        <Card accent>
          <CardBody>
            <p className="text-sm font-semibold text-foreground mb-4">Distribuição de planos</p>
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
                      <span className="text-xs text-muted-fore">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{d.value}</span>
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
            <p className="text-sm font-semibold text-foreground mb-4">Visão geral</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'trending-up-outline',     label: 'Novos (7d)',      value: stats.new_users_7d,                    color: 'text-blue-400' },
                { icon: 'person-add-outline',      label: 'Novos (30d)',     value: stats.new_users_30d,                   color: 'text-emerald-400' },
                { icon: 'swap-horizontal-outline', label: 'Exchanges ativas',value: stats.active_exchanges,                color: 'text-purple-400' },
                { icon: 'git-branch-outline',      label: 'Estratégias',     value: `${stats.active_strategies ?? 0}/${stats.total_strategies ?? 0}`, color: 'text-cyan-400' },
                { icon: 'checkmark-circle-outline',label: 'Verificados',     value: stats.verified_users ?? 0,             color: 'text-green-400' },
                { icon: 'lock-closed-outline',     label: 'Com 2FA',         value: stats.totp_users ?? 0,                 color: 'text-amber-400' },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 bg-muted">
                  <IonIcon name={icon} size={16} className={color} />
                  <div>
                    <p className="text-xs text-muted-fore">{label}</p>
                    <p className="text-lg font-bold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Jobs status */}
      {stats.jobs?.length > 0 && (
        <Card accent>
          <CardBody>
            <p className="text-sm font-semibold text-foreground mb-4">Status dos Jobs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.jobs.map(job => (
                <div key={job.job_id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 bg-muted">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    job.status === 'success' ? 'bg-emerald-400' :
                    job.status === 'running' ? 'bg-blue-400 animate-pulse' :
                    job.status === 'error'   ? 'bg-red-400' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{job.name}</p>
                    <p className="text-xs text-gray-400">{job.runs_today}x hoje</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    job.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                    job.status === 'running' ? 'bg-blue-500/10 text-blue-400' :
                    job.status === 'error'   ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                  }`}>{job.status}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
