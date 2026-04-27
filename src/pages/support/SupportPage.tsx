import { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { apiAdminListTickets, apiAdminGetTicket, apiAdminReplyTicket, apiAdminUpdateStatus } from '@/lib/api'
import { formatDate, formatRelative, statusColor, statusLabel, cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import type { SupportTicket } from '@/types'

const MAX_ATTACH_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_ATTACH_COUNT = 3

const STATUSES = [
  { value: '',            label: 'Todos'      },
  { value: 'open',        label: 'Abertos'    },
  { value: 'in_progress', label: 'Em análise' },
  { value: 'resolved',    label: 'Resolvidos' },
  { value: 'cancelled',   label: 'Cancelados' },
]

function slaInfo(ticket: SupportTicket): { label: string; color: string } | null {
  if (!ticket.sla_deadline) return null
  const remaining = ticket.sla_deadline - Date.now()
  if (remaining <= 0)        return { label: 'SLA vencido',           color: 'bg-destructive/10 text-destructive' }
  const hours = remaining / 3_600_000
  if (hours <= 2)            return { label: `SLA: ${Math.ceil(hours * 60)}min`, color: 'bg-destructive/10 text-destructive' }
  if (hours <= 8)            return { label: `SLA: ${Math.floor(hours)}h`,       color: 'bg-warning/10 text-warning' }
  return                            { label: `SLA: ${Math.floor(hours)}h`,       color: 'bg-success/10 text-success' }
}

export function SupportPage() {
  const { user }     = useAuth()
  const { refresh }  = useNotifications()
  const location     = useLocation()

  const [tickets,     setTickets]     = useState<SupportTicket[]>([])
  const [selected,    setSelected]    = useState<SupportTicket | null>(null)
  const [filter,      setFilter]      = useState('')
  const [search,      setSearch]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [reply,       setReply]       = useState('')
  const [attachments, setAttachments] = useState<{ name: string; data: string; size: number }[]>([])
  const [attachError, setAttachError] = useState('')
  const [sending,     setSending]     = useState(false)
  const [updating,    setUpdating]    = useState(false)
  const scrollRef    = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = tickets.filter(t => {
    const matchStatus = !filter || t.status === filter
    const matchSearch = search.trim() === '' ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.protocol?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiAdminListTickets(filter)
      setTickets(d.tickets)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filter])

  // Carrega tickets e força refresh do contexto de notificações ao entrar na página
  useEffect(() => {
    load()
    refresh()
  }, [load, refresh])

  // Polling local de 30s (o contexto já faz o polling para notificações)
  useEffect(() => {
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  // Deep-link via navigate('/support', { state: { openTicketId } })
  // Usado pelo NotificationsPanel ao clicar numa notificação
  useEffect(() => {
    const state = location.state as { openTicketId?: string } | null
    if (!state?.openTicketId || tickets.length === 0) return
    const t = tickets.find(x => x.id === state.openTicketId)
    if (t) openTicket(t)
    // Limpa o state para não reabrir ao recarregar
    window.history.replaceState({}, '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, tickets])

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
      const attachData = attachments.map(a => a.data)
      const d = await apiAdminReplyTicket(selected.id, reply.trim(), attachData.length ? attachData : undefined)
      setSelected(d.ticket)
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, updated_at: d.ticket.updated_at } : t))
      setReply('')
      setAttachments([])
      setAttachError('')
      setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 100)
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setAttachError('')
    const remaining = MAX_ATTACH_COUNT - attachments.length
    const toProcess = files.slice(0, remaining)
    for (const file of toProcess) {
      if (file.size > MAX_ATTACH_SIZE) {
        setAttachError(`"${file.name}" excede o limite de 2MB`)
        continue
      }
      const reader = new FileReader()
      reader.onload = () => {
        const data = reader.result as string
        setAttachments(prev => [...prev, { name: file.name, data, size: file.size }])
      }
      reader.readAsDataURL(file)
    }
    // reset input
    e.target.value = ''
  }

  const downloadAttachment = (dataUri: string, filename?: string) => {
    const a = document.createElement('a')
    a.href = dataUri
    a.download = filename || 'anexo'
    a.click()
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

  const adminName = user?.name || 'Suporte MEX'

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-muted-fore">{tickets.length} tickets</p>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          <IonIcon name="refresh-outline" size={14} /> Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="relative">
          <IonIcon name="search-outline" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fore" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="E-mail, nome ou protocolo..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-fore outline-none focus:border-primary w-56"
          />
        </div>
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              filter === s.value
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-fore hover:border-primary hover:text-primary'
            )}
          >{s.label}</button>
        ))}
      </div>

      <div className="flex flex-1 gap-3 overflow-hidden min-h-0">
        {/* Ticket list */}
        <div className="w-72 shrink-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-12 text-muted-fore text-xs">Nenhum ticket</p>
            ) : filtered.map(t => {
              const sla = slaInfo(t)
              return (
                <button key={t.id} onClick={() => openTicket(t)} className={cn(
                  'w-full text-left rounded-lg border p-3 transition-all',
                  selected?.id === t.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40'
                )}>
                  {/* Protocol + status */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-muted-fore">
                      #{t.protocol?.toUpperCase()}
                    </span>
                    <Badge className={statusColor(t.status)} dot size="sm">{statusLabel(t.status)}</Badge>
                  </div>
                  {/* Nome em destaque */}
                  <p className="text-xs font-bold text-foreground truncate">{t.name || t.email}</p>
                  {t.name && <p className="text-[10px] text-muted-fore truncate">{t.email}</p>}
                  <p className="text-xs text-muted-fore truncate mt-0.5">{t.subject_label}</p>
                  {/* SLA */}
                  {sla ? (
                    <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5', sla.color)}>
                      <IonIcon name="timer-outline" size={10} /> {sla.label}
                    </span>
                  ) : (
                    <p className="text-[10px] text-muted-fore mt-1.5">{formatRelative(t.created_at)}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selected ? (
            <Card accent className="flex flex-col h-full">
              <CardHeader className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-fore">
                        #{selected.protocol?.toUpperCase()}
                      </span>
                      <Badge className={statusColor(selected.status)} dot size="sm">{statusLabel(selected.status)}</Badge>
                      {(() => {
                        const sla = slaInfo(selected)
                        return sla ? (
                          <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded', sla.color)}>
                            <IonIcon name="timer-outline" size={10} /> {sla.label}
                          </span>
                        ) : null
                      })()}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{selected.subject_label}</p>
                    <p className="text-xs text-muted-fore">
                      {selected.name && <><span className="font-medium text-foreground">{selected.name}</span> · </>}
                      {selected.email} · {formatDate(selected.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selected.status} onChange={e => handleStatus(e.target.value)}
                      disabled={updating}
                      className="text-xs px-2 py-1 rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary"
                    >
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em análise</option>
                      <option value="resolved">Resolvido</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    <button onClick={() => setSelected(null)} className="text-muted-fore hover:text-foreground">
                      <IonIcon name="close-outline" size={16} />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
                {/* Original message */}
                <div className="flex justify-start">
                  <div className="max-w-[78%] bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold text-muted-fore mb-1">{selected.name || selected.email}</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                    {/* Anexos do ticket original */}
                    {selected.attachments?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selected.attachments.map((a, i) => {
                          const isImg = a.startsWith('data:image')
                          return (
                            <button
                              key={i}
                              onClick={() => downloadAttachment(a, `ticket-anexo-${i + 1}`)}
                              className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:opacity-80 transition-opacity"
                              title="Baixar anexo"
                            >
                              <IonIcon name={isImg ? 'image-outline' : 'document-outline'} size={11} />
                              Anexo {i + 1}
                              <IonIcon name="download-outline" size={10} />
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                    <p className="text-[10px] text-muted-fore mt-2">{formatDate(selected.created_at)}</p>
                  </div>
                </div>

                {selected.comments?.map(c => (
                  <div key={c.id} className={cn('flex', c.is_admin ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[78%] rounded-2xl px-4 py-3 shadow-sm',
                      c.is_admin
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    )}>
                      <p className={cn('text-[11px] font-semibold mb-1', c.is_admin ? 'text-white/70' : 'text-muted-fore')}>
                        {c.is_admin ? `Suporte: ${adminName}` : c.author}
                      </p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.text}</p>
                      {/* Anexos do comentário */}
                      {c.attachments?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {c.attachments.map((a, i) => {
                            const isImg = a.startsWith('data:image')
                            return (
                              <button
                                key={i}
                                onClick={() => downloadAttachment(a, `anexo-${i + 1}`)}
                                className={cn(
                                  'flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg transition-opacity hover:opacity-80',
                                  c.is_admin ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary border border-primary/20'
                                )}
                                title="Baixar anexo"
                              >
                                <IonIcon name={isImg ? 'image-outline' : 'document-outline'} size={11} />
                                Anexo {i + 1}
                                <IonIcon name="download-outline" size={10} />
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                      <p className={cn('text-[10px] mt-2', c.is_admin ? 'text-white/60' : 'text-muted-fore')}>
                        {formatDate(c.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              {(selected.status === 'open' || selected.status === 'in_progress') && (
                <div className="p-3 border-t border-border bg-card space-y-2">
                  {/* Anexos pendentes */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {attachments.map((a, i) => {
                        const isImg = a.data.startsWith('data:image')
                        return (
                          <div key={i} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg px-2 py-1 text-[11px] font-medium">
                            <IonIcon name={isImg ? 'image-outline' : 'document-outline'} size={11} />
                            <span className="max-w-[120px] truncate">{a.name}</span>
                            <span className="text-muted-fore">({(a.size / 1024).toFixed(0)}KB)</span>
                            <button onClick={() => setAttachments(p => p.filter((_, j) => j !== i))} className="ml-0.5 text-muted-fore hover:text-destructive">
                              <IonIcon name="close-outline" size={12} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {attachError && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <IonIcon name="warning-outline" size={12} /> {attachError}
                    </p>
                  )}
                  {/* Input row */}
                  <div className="flex gap-2">
                    <textarea
                      value={reply} onChange={e => setReply(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleReply()
                        }
                      }}
                      placeholder="Responder... (Enter envia · Shift+Enter nova linha)"
                      rows={2}
                      className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-fore outline-none focus:border-primary resize-none"
                    />
                    <div className="flex flex-col gap-1.5 self-end shrink-0">
                      {/* Botão de anexo */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <button
                        type="button"
                        disabled={attachments.length >= MAX_ATTACH_COUNT}
                        onClick={() => fileInputRef.current?.click()}
                        title={`Anexar arquivo (máx ${MAX_ATTACH_COUNT}x 2MB)`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-muted text-muted-fore hover:text-primary hover:border-primary disabled:opacity-40 transition-colors"
                      >
                        <IonIcon name="attach-outline" size={16} />
                      </button>
                      <Button onClick={handleReply} loading={sending} disabled={!reply.trim()} className="h-8 w-8 p-0 flex items-center justify-center">
                        <IonIcon name="send-outline" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-fore text-sm">
              <div className="flex flex-col items-center gap-3">
                <IonIcon name="chatbubbles-outline" size={40} className="opacity-20" />
                <span className="text-xs">Selecione um ticket para ver o chat</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
