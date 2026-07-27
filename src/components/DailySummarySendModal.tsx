import { useCallback, useEffect, useState } from 'react'
import {
  apiAdminSendDailySummary,
  apiListUserIdsMatching,
  apiListUsers,
} from '@/lib/api'
import { planColor, planLabel, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import type { AdminUser } from '@/types'

const PLANS = ['', 'free', 'pro', 'premium'] as const
const PAGE_SIZE = 50

type ActiveFilter = 'all' | 'active' | 'blocked'

interface Props {
  onClose: () => void
  onDone: (msg: string) => void
}

export function DailySummarySendModal({ onClose, onDone }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('')
  const [active, setActive] = useState<ActiveFilter>('active')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectingAll, setSelectingAll] = useState(false)
  const [sending, setSending] = useState(false)
  const [broadcasting, setBroadcasting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeParam =
    active === 'all' ? undefined : active === 'active'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const d = await apiListUsers(page, search, plan, {
        limit: PAGE_SIZE,
        active: activeParam,
      })
      setUsers(d.users)
      setTotal(d.total)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Falha ao listar usuários')
    } finally {
      setLoading(false)
    }
  }, [page, search, plan, activeParam])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePage = () => {
    const pageIds = users.map(u => u.user_id)
    const allOnPage = pageIds.length > 0 && pageIds.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allOnPage) pageIds.forEach(id => next.delete(id))
      else pageIds.forEach(id => next.add(id))
      return next
    })
  }

  const selectAllMatching = async () => {
    setSelectingAll(true)
    setError(null)
    try {
      const { ids } = await apiListUserIdsMatching({
        search,
        plan,
        active: activeParam,
      })
      setSelected(new Set(ids))
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Falha ao selecionar todos')
    } finally {
      setSelectingAll(false)
    }
  }

  const clearSelection = () => setSelected(new Set())

  const sendSelected = async () => {
    if (selected.size === 0) return
    if (!window.confirm(
      `Enviar resumo diário (push + email) para ${selected.size} usuário(s) selecionado(s)?\n\nIgnora horário e cooldown do dia.`,
    )) return

    setSending(true)
    setError(null)
    try {
      const r = await apiAdminSendDailySummary({
        user_ids: Array.from(selected),
        force: true,
      })
      const failed = r.failed ?? 0
      const msg = failed > 0
        ? `Enviado: ${r.sent ?? 0}/${r.requested ?? selected.size} · ${failed} falha(s)`
        : `Enviado: ${r.sent ?? 0} usuário(s) · push + email`
      onDone(msg)
      onClose()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Falha ao enviar')
    } finally {
      setSending(false)
    }
  }

  const sendBroadcast = async () => {
    if (!window.confirm(
      'Enviar o resumo diário agora (push + email) para TODOS os usuários com o resumo habilitado?\n\nIgnora horário e cooldown do dia.',
    )) return

    setBroadcasting(true)
    setError(null)
    try {
      const r = await apiAdminSendDailySummary({ force: true })
      onDone(`Broadcast: ${r.sent ?? 0} usuário(s) com resumo habilitado`)
      onClose()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Falha no broadcast')
    } finally {
      setBroadcasting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageIds = users.map(u => u.user_id)
  const allOnPage = pageIds.length > 0 && pageIds.every(id => selected.has(id))
  const busy = sending || broadcasting || selectingAll

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <IonIcon name="newspaper-outline" size={20} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground">Enviar resumo diário</h3>
            <p className="text-[11px] text-muted-fore">
              Selecione destinatários com filtros · force ativo (ignora horário/cooldown)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-fore hover:text-foreground hover:bg-muted transition-colors"
          >
            <IonIcon name="close-outline" size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-border space-y-2.5 shrink-0">
          <div className="relative">
            <IonIcon
              name="search-outline"
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fore"
            />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-fore outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PLANS.map(p => (
              <button
                key={p || 'all'}
                type="button"
                onClick={() => { setPlan(p); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors',
                  plan === p
                    ? 'bg-primary text-white border-primary'
                    : 'border-border bg-background text-muted-fore hover:border-primary/50',
                )}
              >
                {p === '' ? 'Todos planos' : planLabel(p)}
              </button>
            ))}
            <span className="w-px self-stretch bg-border mx-0.5" />
            {([
              ['all', 'Todos'],
              ['active', 'Ativos'],
              ['blocked', 'Bloqueados'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setActive(key); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors',
                  active === key
                    ? 'bg-primary text-white border-primary'
                    : 'border-border bg-background text-muted-fore hover:border-primary/50',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              loading={selectingAll}
              disabled={busy || total === 0}
              onClick={() => void selectAllMatching()}
              title="Busca todos os IDs que batem com o filtro atual (todas as páginas)"
            >
              <IonIcon name="checkbox-outline" size={14} />
              Selecionar todos do filtro ({total})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy || selected.size === 0}
              onClick={clearSelection}
            >
              Limpar seleção
            </Button>
            <span className="text-[11px] text-muted-fore ml-auto tabular-nums">
              {selected.size} selecionado(s) · {total} no filtro
            </span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-muted-fore py-16">Nenhum usuário encontrado</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-border z-10">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={allOnPage}
                      onChange={togglePage}
                      disabled={busy}
                      className="rounded border-border"
                      title="Selecionar página atual"
                    />
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-fore px-2 py-2">Usuário</th>
                  <th className="text-left text-[11px] font-semibold text-muted-fore px-3 py-2 w-24">Plano</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => {
                  const checked = selected.has(u.user_id)
                  return (
                    <tr
                      key={u.user_id}
                      onClick={() => !busy && toggle(u.user_id)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        checked ? 'bg-primary/5' : 'hover:bg-muted/40',
                      )}
                    >
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={busy}
                          onChange={() => toggle(u.user_id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-2 py-2.5 min-w-0">
                        <p className="font-medium text-foreground truncate text-xs">
                          {u.name || '—'}
                        </p>
                        <p className="text-[11px] text-muted-fore truncate">{u.email}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge className={planColor(u.subscription_plan)} size="sm">
                          {planLabel(u.subscription_plan)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-2 border-t border-border shrink-0">
            <p className="text-[11px] text-muted-fore">
              Página {page} de {totalPages}
              <span className="text-muted-fore/70"> · checkbox do cabeçalho = só esta página</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1 || busy}
                onClick={() => setPage(p => p - 1)}
              >
                <IonIcon name="chevron-back-outline" size={14} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages || busy}
                onClick={() => setPage(p => p + 1)}
              >
                <IonIcon name="chevron-forward-outline" size={14} />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="px-5 py-2 text-xs text-destructive border-t border-border shrink-0">{error}</p>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex flex-wrap justify-end gap-2 bg-muted/30 shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={broadcasting}
            disabled={busy}
            onClick={() => void sendBroadcast()}
            title="Todos com daily summary habilitado (não usa a seleção)"
          >
            <IonIcon name="radio-outline" size={14} />
            Todos habilitados
          </Button>
          <Button
            size="sm"
            loading={sending}
            disabled={busy || selected.size === 0}
            onClick={() => void sendSelected()}
          >
            <IonIcon name="send-outline" size={14} />
            Enviar para {selected.size || '…'}
          </Button>
        </div>
      </div>
    </div>
  )
}
