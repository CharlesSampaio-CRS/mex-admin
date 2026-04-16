import { useEffect, useState, useCallback } from 'react'
import { apiListUsers, apiUpdateUserPlan } from '@/lib/api'
import { formatDate, planColor, planLabel, cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AdminUser } from '@/types'

const PLANS = ['', 'free', 'pro', 'premium']

export function UsersPage() {
  const [users,   setUsers]   = useState<AdminUser[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [plan,    setPlan]    = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiListUsers(page, search, plan)
      setUsers(d.users)
      setTotal(d.total)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, plan])

  useEffect(() => { load() }, [load])

  const changePlan = async (userId: string, newPlan: string) => {
    setUpdating(userId)
    try {
      await apiUpdateUserPlan(userId, newPlan)
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, subscription_plan: newPlan as AdminUser['subscription_plan'] } : u))
    } catch (e) { console.error(e) }
    finally { setUpdating(null) }
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuários</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} registrados</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          <RefreshCw size={14} /> Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <select
          value={plan} onChange={e => { setPlan(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white outline-none focus:border-primary"
        >
          <option value="">Todos os planos</option>
          {PLANS.filter(Boolean).map(p => <option key={p} value={p}>{planLabel(p)}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/8">
                {['Usuário', 'Plano', 'Exchanges', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                  <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-500">Nenhum usuário encontrado</td></tr>
              ) : users.map(u => (
                <tr key={u.user_id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
                        {u.name?.charAt(0) ?? u.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{u.name || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={planColor(u.subscription_plan)} dot>{planLabel(u.subscription_plan)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.exchange_count}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.subscription_plan}
                      onChange={e => changePlan(u.user_id, e.target.value)}
                      disabled={updating === u.user_id}
                      className={cn(
                        'text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 outline-none focus:border-primary',
                        updating === u.user_id && 'opacity-50 cursor-wait'
                      )}
                    >
                      {PLANS.filter(Boolean).map(p => <option key={p} value={p}>{planLabel(p)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-white/8">
            <p className="text-xs text-gray-500 dark:text-gray-400">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
