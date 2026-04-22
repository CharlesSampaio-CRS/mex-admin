import React, { useEffect, useState } from 'react'
import {
  apiAdminSecurityEvents,
  apiAdminBackfillOwnerProofs,
  apiAdminSharedCredentials,
  type SecurityEventItem,
  type BackfillReport,
  type SharedCredentialGroup,
} from '@/lib/api'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import { formatRelative } from '@/lib/utils'

// ── helpers ──────────────────────────────────────────────────────────────────
const EVENT_META: Record<string, { label: string; severity: 'critical' | 'warning' | 'info'; icon: string; description: string }> = {
  cross_user_dedup: {
    label: 'Chave em conta alheia',
    severity: 'critical',
    icon: 'shield-checkmark-outline',
    description: 'Um usuário tentou cadastrar uma API key que JÁ pertence a outra conta. Bloqueado automaticamente. Possível tentativa de fraude ou compartilhamento indevido.',
  },
  same_user_dedup: {
    label: 'Duplicata na mesma conta',
    severity: 'info',
    icon: 'copy-outline',
    description: 'O usuário tentou cadastrar uma API key que ele mesmo já tinha. Bloqueado pra evitar duplicidade. Sem riscos.',
  },
  ownership_mismatch: {
    label: 'Proof inválido (CRÍTICO)',
    severity: 'critical',
    icon: 'warning-outline',
    description: 'Uma credencial tem o selo de segurança inválido — indica manipulação direta no banco de dados ou rotação de ENCRYPTION_KEY sem migração. Credencial foi BLOQUEADA automaticamente.',
  },
  decrypt_failure: {
    label: 'Falha ao decriptar',
    severity: 'critical',
    icon: 'close-circle-outline',
    description: 'Não foi possível decriptar uma credencial com a ENCRYPTION_KEY atual. Pode ser: chave foi rotacionada, credencial corrompida ou tampering.',
  },
  ownership_proof_missing: {
    label: 'Proof ausente (legado)',
    severity: 'warning',
    icon: 'alert-circle-outline',
    description: 'Credencial criada ANTES da feature de segurança ser implantada. Não representa risco, mas precisa passar pelo backfill.',
  },
  ownership_proof_backfilled: {
    label: 'Proof migrado',
    severity: 'info',
    icon: 'checkmark-done-outline',
    description: 'Credencial legada ganhou o selo de segurança pelo backfill. Está agora 100% protegida.',
  },
  cross_user_access: {
    label: 'Acesso cross-user',
    severity: 'critical',
    icon: 'shield-half-outline',
    description: 'Tentativa de acesso a credencial de outro usuário. Bloqueado.',
  },
}

function severityBadge(sev: string) {
  if (sev === 'critical') return <Badge variant="danger" size="sm" dot>crítico</Badge>
  if (sev === 'warning')  return <Badge variant="warning" size="sm" dot>warning</Badge>
  return <Badge variant="info" size="sm" dot>info</Badge>
}

function extractDate(value: SecurityEventItem['created_at']): Date | null {
  if (!value) return null
  if (typeof value === 'string') return new Date(value)
  const inner = (value as { $date?: unknown }).$date
  if (typeof inner === 'string') return new Date(inner)
  if (inner && typeof inner === 'object' && '$numberLong' in inner) {
    return new Date(Number((inner as { $numberLong: string }).$numberLong))
  }
  return null
}

function truncate(s: string, n = 10) {
  return s.length > n ? `${s.slice(0, n)}…` : s
}

export function SecurityPage() {
  const [events, setEvents] = useState<SecurityEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')       // event type filter
  const [userFilter, setUserFilter] = useState('')        // user_id filter

  const [backfilling, setBackfilling] = useState(false)
  const [backfillReport, setBackfillReport] = useState<BackfillReport | null>(null)
  const [backfillError, setBackfillError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Duplicates (shared credentials between users)
  const [duplicates, setDuplicates] = useState<SharedCredentialGroup[]>([])
  const [loadingDups, setLoadingDups] = useState(true)

  // Expandable rows
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const loadDuplicates = async () => {
    setLoadingDups(true)
    try {
      const d = await apiAdminSharedCredentials()
      setDuplicates(d.duplicates)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDups(false)
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const d = await apiAdminSecurityEvents({
        event: filter || undefined,
        user_id: userFilter || undefined,
        limit: 200,
      })
      setEvents(d.events)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter])
  useEffect(() => { loadDuplicates() }, [])

  const runBackfill = async () => {
    setBackfilling(true)
    setBackfillError(null)
    setBackfillReport(null)
    try {
      const d = await apiAdminBackfillOwnerProofs()
      setBackfillReport(d.report)
      // recarrega eventos pra mostrar os OwnershipProofBackfilled
      await load()
      await loadDuplicates()
    } catch (e) {
      setBackfillError((e as Error).message)
    } finally {
      setBackfilling(false)
      setConfirmOpen(false)
    }
  }

  // ── métricas resumidas ────────────────────────────────────────────────────
  const criticalCount = events.filter(e => e.severity === 'critical').length
  const warningCount  = events.filter(e => e.severity === 'warning').length
  const byEvent: Record<string, number> = {}
  for (const e of events) byEvent[e.event] = (byEvent[e.event] ?? 0) + 1

  return (
    <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-fore">
          Auditoria de eventos de segurança e migração de ownership proofs
        </p>
        <Button variant="secondary" size="sm" onClick={load}>
          <IonIcon name="refresh-outline" size={14} /> Atualizar
        </Button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center gap-2">
              <IonIcon name="shield-checkmark-outline" size={18} className="text-danger" />
              <div>
                <div className="text-lg font-semibold">{criticalCount}</div>
                <div className="text-[11px] text-muted-fore">Eventos críticos</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center gap-2">
              <IonIcon name="alert-circle-outline" size={18} className="text-warning" />
              <div>
                <div className="text-lg font-semibold">{warningCount}</div>
                <div className="text-[11px] text-muted-fore">Warnings</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center gap-2">
              <IonIcon name="pulse-outline" size={18} className="text-primary" />
              <div>
                <div className="text-lg font-semibold">{events.length}</div>
                <div className="text-[11px] text-muted-fore">Total recentes</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center gap-2">
              <IonIcon name="copy-outline" size={18} className="text-muted-fore" />
              <div>
                <div className="text-lg font-semibold">{byEvent.cross_user_dedup ?? 0}</div>
                <div className="text-[11px] text-muted-fore">Tentativas cross-user</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Credenciais compartilhadas entre usuários (duplicatas detectadas) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <IonIcon
                name={duplicates.length > 0 ? 'warning-outline' : 'checkmark-circle-outline'}
                size={16}
                className={duplicates.length > 0 ? 'text-danger' : 'text-success'}
              />
              <span className="font-semibold">Credenciais compartilhadas entre usuários</span>
              <Badge variant={duplicates.length > 0 ? 'danger' : 'success'} size="sm">
                {duplicates.length}
              </Badge>
            </div>
            <Button variant="secondary" size="sm" onClick={loadDuplicates}>
              <IonIcon name="refresh-outline" size={12} />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loadingDups ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : duplicates.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-fore">
              <IonIcon name="shield-checkmark-outline" size={28} className="mb-2 text-success" />
              <div>Nenhuma credencial compartilhada detectada.</div>
              <div className="text-[10px] mt-1">Cada API key está vinculada a apenas 1 usuário. ✅</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium text-muted-fore">Hash da API key</th>
                    <th className="px-3 py-2 font-medium text-muted-fore">Exchanges</th>
                    <th className="px-3 py-2 font-medium text-muted-fore text-center">Contas</th>
                    <th className="px-3 py-2 font-medium text-muted-fore">Emails envolvidos</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((dup, idx) => (
                    <tr key={idx} className="border-t border-border hover:bg-muted/20">
                      <td className="px-3 py-2 font-mono text-[10px] text-muted-fore" title={dup.api_key_hash}>
                        {dup.api_key_hash.slice(0, 16)}…
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {dup.exchange_types.map(t => (
                            <Badge key={t} variant="default" size="sm">{t}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant="danger" size="sm">{dup.count}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          {dup.emails.map((email, i) => (
                            <span key={i} className="text-[11px]">{email}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 text-[10px] text-muted-fore border-t border-border bg-muted/20">
                ⚠️ Cada API key deve pertencer a apenas 1 usuário. Revise e remova duplicatas quando possível.
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Migração (backfill) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IonIcon name="key-outline" size={16} />
            <span className="font-semibold">Migração de ownership proofs</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-xs text-muted-fore leading-relaxed">
            Popula o campo <code className="px-1 bg-muted rounded">owner_proof</code> em credenciais antigas
            (anteriores a esta feature de segurança). Idempotente — pode rodar quantas vezes quiser.
            Nenhuma credencial é alterada, apenas validada e selada.
          </p>

          {backfillReport && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              {[
                ['Usuários', backfillReport.scanned_users, 'text-foreground'],
                ['Credenciais', backfillReport.scanned_exchanges, 'text-foreground'],
                ['Seladas agora', backfillReport.backfilled, 'text-success'],
                ['Já seladas', backfillReport.already_had_proof, 'text-muted-fore'],
                ['Decrypt fail', backfillReport.decrypt_failures, backfillReport.decrypt_failures ? 'text-danger' : 'text-muted-fore'],
                ['Update fail', backfillReport.update_failures, backfillReport.update_failures ? 'text-danger' : 'text-muted-fore'],
              ].map(([label, value, cls]) => (
                <div key={String(label)} className="border border-border rounded-lg p-2">
                  <div className={`text-sm font-semibold ${cls as string}`}>{String(value)}</div>
                  <div className="text-[10px] text-muted-fore">{String(label)}</div>
                </div>
              ))}
            </div>
          )}

          {backfillError && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg p-2">
              <IonIcon name="warning-outline" size={12} className="inline mr-1" />
              {backfillError}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!confirmOpen ? (
              <Button
                variant="primary"
                size="sm"
                disabled={backfilling}
                onClick={() => setConfirmOpen(true)}
              >
                <IonIcon name="shield-half-outline" size={14} />
                Rodar migração
              </Button>
            ) : (
              <>
                <span className="text-xs text-muted-fore">Confirmar execução?</span>
                <Button variant="primary" size="sm" disabled={backfilling} onClick={runBackfill}>
                  {backfilling ? (
                    <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Rodando…</>
                  ) : (
                    <>Sim, rodar</>
                  )}
                </Button>
                <Button variant="secondary" size="sm" disabled={backfilling} onClick={() => setConfirmOpen(false)}>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Filtros + tabela de eventos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
            <div className="flex items-center gap-2">
              <IonIcon name="list-outline" size={16} />
              <span className="font-semibold">Eventos de segurança</span>
              <Badge variant="default" size="sm">{events.length}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="text-xs px-2 py-1.5 rounded-lg bg-background border border-border"
              >
                <option value="">Todos os tipos</option>
                {Object.entries(EVENT_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="User ID"
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') load() }}
                className="text-xs px-2 py-1.5 rounded-lg bg-background border border-border w-40"
              />
              <Button variant="secondary" size="sm" onClick={load}>
                <IonIcon name="search-outline" size={12} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-fore">
              <IonIcon name="checkmark-circle-outline" size={32} className="mb-2 text-success" />
              <div>Nenhum evento encontrado.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium text-muted-fore">Quando</th>
                    <th className="px-3 py-2 font-medium text-muted-fore">Evento</th>
                    <th className="px-3 py-2 font-medium text-muted-fore">Severidade</th>
                    <th className="px-3 py-2 font-medium text-muted-fore">User</th>
                    <th className="px-3 py-2 font-medium text-muted-fore">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, idx) => {
                    const meta = EVENT_META[ev.event] ?? { label: ev.event, severity: ev.severity, icon: 'help-circle-outline', description: '' }
                    const when = extractDate(ev.created_at)
                    const isOpen = expandedIdx === idx
                    const userEmail = ev.user?.email
                    const userName = ev.user?.name
                    const details = (ev.details ?? {}) as Record<string, unknown>
                    const ownerUser = details.owner_user as { email?: string; name?: string } | undefined
                    return (
                      <React.Fragment key={idx}>
                        <tr
                          className={`border-t border-border cursor-pointer hover:bg-muted/20 ${isOpen ? 'bg-muted/20' : ''}`}
                          onClick={() => setExpandedIdx(isOpen ? null : idx)}
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-muted-fore">
                            <div className="flex items-center gap-1.5">
                              <IonIcon name={isOpen ? 'chevron-down-outline' : 'chevron-forward-outline'} size={11} />
                              {when ? formatRelative(when.toISOString()) : '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <IonIcon name={meta.icon} size={13} className={
                                meta.severity === 'critical' ? 'text-danger' :
                                meta.severity === 'warning'  ? 'text-warning' : 'text-primary'
                              } />
                              <span>{meta.label}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">{severityBadge(ev.severity)}</td>
                          <td className="px-3 py-2 text-muted-fore" title={ev.user_id}>
                            {userEmail ? (
                              <div className="flex flex-col">
                                <span>{userEmail}</span>
                                {userName && <span className="text-[10px] opacity-60">{userName}</span>}
                              </div>
                            ) : (
                              <span className="font-mono">{truncate(ev.user_id || '—', 12)}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-muted-fore max-w-[320px] truncate">
                            {ev.details ? JSON.stringify(ev.details) : '—'}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-muted/10 border-t border-border">
                            <td colSpan={5} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Descrição */}
                                {meta.description && (
                                  <div className="md:col-span-2 p-3 rounded-lg bg-background border border-border">
                                    <div className="text-[10px] uppercase tracking-wide text-muted-fore mb-1">O que isso significa</div>
                                    <div className="text-xs">{meta.description}</div>
                                  </div>
                                )}

                                {/* Usuário */}
                                <div className="p-3 rounded-lg bg-background border border-border">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-fore mb-1 flex items-center gap-1">
                                    <IonIcon name="person-outline" size={11} /> Usuário
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    {userEmail && <div><span className="text-muted-fore">Email:</span> <span className="font-medium">{userEmail}</span></div>}
                                    {userName && <div><span className="text-muted-fore">Nome:</span> {userName}</div>}
                                    <div className="font-mono text-[10px] text-muted-fore break-all">
                                      <span>ID:</span> {ev.user_id || '—'}
                                    </div>
                                    {ev.user_id && (
                                      <button
                                        className="text-[10px] text-primary hover:underline mt-1"
                                        onClick={(e) => { e.stopPropagation(); setUserFilter(ev.user_id!); load() }}
                                      >
                                        Ver todos eventos deste usuário →
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Quando */}
                                <div className="p-3 rounded-lg bg-background border border-border">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-fore mb-1 flex items-center gap-1">
                                    <IonIcon name="time-outline" size={11} /> Quando
                                  </div>
                                  <div className="text-xs">
                                    {when ? (
                                      <>
                                        <div>{when.toLocaleString('pt-BR')}</div>
                                        <div className="text-muted-fore text-[10px]">{formatRelative(when.toISOString())}</div>
                                      </>
                                    ) : '—'}
                                  </div>
                                </div>

                                {/* Owner user (quando cross_user_dedup) */}
                                {ownerUser && (
                                  <div className="md:col-span-2 p-3 rounded-lg bg-danger/5 border border-danger/30">
                                    <div className="text-[10px] uppercase tracking-wide text-danger mb-1 flex items-center gap-1">
                                      <IonIcon name="shield-checkmark-outline" size={11} /> Dono real da API key
                                    </div>
                                    <div className="text-xs space-y-1">
                                      {ownerUser.email && <div><span className="text-muted-fore">Email:</span> <span className="font-medium">{ownerUser.email}</span></div>}
                                      {ownerUser.name && <div><span className="text-muted-fore">Nome:</span> {ownerUser.name}</div>}
                                      {Boolean(details.owner_user_id) && (
                                        <div className="font-mono text-[10px] text-muted-fore break-all">
                                          <span>ID:</span> {String(details.owner_user_id)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* JSON completo */}
                                <div className="md:col-span-2 p-3 rounded-lg bg-background border border-border">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-[10px] uppercase tracking-wide text-muted-fore flex items-center gap-1">
                                      <IonIcon name="code-slash-outline" size={11} /> Detalhes técnicos
                                    </div>
                                    <button
                                      className="text-[10px] text-primary hover:underline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigator.clipboard.writeText(JSON.stringify(ev, null, 2))
                                      }}
                                    >
                                      Copiar JSON
                                    </button>
                                  </div>
                                  <pre className="text-[10px] font-mono bg-muted/30 p-2 rounded overflow-x-auto max-h-64">
{JSON.stringify(ev.details ?? {}, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
