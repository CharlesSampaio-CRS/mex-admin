import { useEffect, useState, useCallback, useRef } from 'react'
import { apiAdminListTickets, apiAdminGetTicket, apiAdminReplyTicket, apiAdminUpdateStatus } from '@/lib/api'
import { formatDate, formatRelative, statusColor, statusLabel, cn } from '@/lib/utils'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RefreshCw, Send, ChevronRight, X } from 'lucide-react'
import type { SupportTicket } from '@/types'

const STATUSES = [
  { value: '',            label: 'Todos'      },
  { value: 'open',        label: 'Abertos'    },
  { value: 'in_progress', label: 'Em análise' },
  { value: 'resolved',    label: 'Resolvidos' },
  { value: 'cancelled',   label: 'Cancelados' },
]

export function SupportPage() {
  const [tickets,  setTickets]  = useState<SupportTicket[]>([])
  const [selected, setSelected] = useState<SupportTicket | null>(null)
  const [filter,   setFilter]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [reply,    setReply]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [updating, setUpdating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiAdminListTickets(filter)
      setTickets(d.tickets)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const openTicket = async (t: SupportTicket) => {
    setSelected(t)
    try {
      const d = await apiAdminGetTicket(t.id)
      setSelected(d.ticket)
      setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 100)
    } catch (e) { console.error(e) }
  }

  const handleReply = async () => {
    if (!selected || !reply.trim()) return
    setSending(true)
    try {
      const d = await apiAdminReplyTicket(selected.id, reply.trim())
      setSelected(d.ticket)
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, updated_at: d.ticket.updated_at } : t))
      setReply('')
      setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 100)
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  const handleStatus = async (status: string) => {
    if (!selected) return
    setUpdating(true)
    try {
      const d = await apiAdminUpdateStatus(selected.id, status)
      setSelected(d.ticket)
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: d.ticket.status } : t))
    } catch (e) { console.error(e) }
    finally { setUpdating(false) }
  }

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suporte</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tickets.length} tickets</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          <RefreshCw size={14} /> Atualizar
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              filter === s.value
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary'
            )}
          >{s.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">Nenhum ticket</p>
          ) : tickets.map(t => (
            <button key={t.id} onClick={() => openTicket(t)} className={cn(
              'w-full text-left rounded-xl border p-3 transition-colors',
              selected?.id === t.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a24] hover:border-primary/40'
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">#{t.protocol}</span>
                <Badge className={statusColor(t.status)} dot>{statusLabel(t.status)}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.subject_label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{t.email}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{formatRelative(t.created_at)}</span>
                <ChevronRight size={12} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Chat panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <Card accent className="flex flex-col h-full max-h-[700px]">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">#{selected.protocol}</span>
                      <Badge className={statusColor(selected.status)} dot>{statusLabel(selected.status)}</Badge>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selected.subject_label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selected.email} · {formatDate(selected.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selected.status} onChange={e => handleStatus(e.target.value)}
                      disabled={updating}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 outline-none focus:border-primary"
                    >
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em análise</option>
                      <option value="resolved">Resolvido</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Original message */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-gray-100 dark:bg-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{selected.name || selected.email}</p>
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selected.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(selected.created_at)}</p>
                  </div>
                </div>

                {/* Comments thread */}
                {selected.comments?.map(c => (
                  <div key={c.id} className={cn('flex', c.is_admin ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      c.is_admin
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-white/8 text-gray-900 dark:text-white rounded-tl-sm'
                    )}>
                      <p className={cn('text-xs mb-1 font-medium', c.is_admin ? 'text-white/70' : 'text-gray-500 dark:text-gray-400')}>
                        {c.is_admin ? 'Suporte MEX' : c.author}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{c.text}</p>
                      <p className={cn('text-xs mt-1', c.is_admin ? 'text-white/50' : 'text-gray-400')}>
                        {formatDate(c.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              {(selected.status === 'open' || selected.status === 'in_progress') && (
                <div className="p-3 border-t border-gray-200 dark:border-white/8 flex gap-2">
                  <textarea
                    value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleReply() }}
                    placeholder="Responder... (⌘Enter para enviar)"
                    rows={2}
                    className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary resize-none"
                  />
                  <Button onClick={handleReply} loading={sending} disabled={!reply.trim()} className="shrink-0 self-end">
                    <Send size={14} />
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400 dark:text-gray-500 text-sm">
              Selecione um ticket para ver o chat
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
