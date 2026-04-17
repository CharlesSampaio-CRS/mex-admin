import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { apiListUsers, apiUpdateUserPlan } from '@/lib/api'
import { formatDate, planColor, planLabel, cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import { UserDetailModal } from '@/components/UserDetailModal'
import type { AdminUser } from '@/types'

const PLANS = ['', 'free', 'pro', 'premium']

function UserAvatar({ user }: { user: AdminUser }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = (user.name?.charAt(0) ?? user.email.charAt(0)).toUpperCase()

  if (user.avatar && !imgFailed) {
    return (
      <img
        src={user.avatar}
        alt={user.name || user.email}
        className="w-8 h-8 rounded-full object-cover shrink-0"
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
      {initials}
    </div>
  )
}

export function UsersPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [plan,     setPlan]     = useState('')
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminUser | null>(null)

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
    <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-fore">{total} registrados</p>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          <IonIcon name="refresh-outline" size={14} /> Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <IonIcon name="search-outline" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-fore outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          {PLANS.map(p => (
            <button
              key={p}
              onClick={() => { setPlan(p); setPage(1) }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                plan === p
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-white dark:bg-white/5 text-muted-fore hover:border-primary/50'
              )}
            >
              {p === '' ? 'Todos' : planLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Usuário', 'Plano', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-fore px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">
                  <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-fore">Nenhum usuário encontrado</td></tr>
              ) : users.map(u => (
                <tr
                  key={u.user_id}
                  onClick={() => setSelected(u)}
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} />
                      <div>
                        <p className="font-medium text-foreground">{u.name || '—'}</p>
                        <p className="text-xs text-muted-fore">{u.email}</p>
                      </div>
                      {(u.open_tickets ?? 0) > 0 && (
                        <Link
                          to="/support"
                          onClick={e => e.stopPropagation()}
                          title={`${u.open_tickets} ticket(s) aberto(s)`}
                          className="ml-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive text-[10px] font-semibold hover:bg-destructive/20 transition-colors shrink-0"
                        >
                          <IonIcon name="headset-outline" size={11} />
                          {u.open_tickets}
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={planColor(u.subscription_plan)} dot>{planLabel(u.subscription_plan)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-fore text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={u.subscription_plan}
                      onChange={e => changePlan(u.user_id, e.target.value)}
                      disabled={updating === u.user_id}
                      className={cn(
                        'text-xs px-2 py-1 rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary',
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-fore">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <IonIcon name="chevron-back-outline" size={14} />
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <IonIcon name="chevron-forward-outline" size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onUserUpdated={updated => {
            setSelected(updated)
            setUsers(prev => prev.map(u => u.user_id === updated.user_id ? updated : u))
          }}
        />
      )}
    </div>
  )
}
