import { useEffect, useState } from 'react'
import {
  apiAdminExchangesCatalog, apiAdminExchangeStats,
  apiAdminCreateExchange, apiAdminUpdateExchange,
  apiAdminToggleExchange, apiAdminDeleteExchange,
  type ExchangeCatalogInput,
} from '@/lib/api'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import { cn } from '@/lib/utils'
import type { CatalogExchange, ExchangeStats } from '@/types'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'

// ─── CoinGecko icon helper ─────────────────────────────────────────────────

// Domínio oficial de cada exchange para buscar favicon via Google
const EXCHANGE_DOMAIN: Record<string, string> = {
  binance:         'binance.com',
  bybit:           'bybit.com',
  okx:             'okx.com',
  okex:            'okx.com',
  kucoin:          'kucoin.com',
  kraken:          'kraken.com',
  krakenfutures:   'kraken.com',
  coinbase:        'coinbase.com',
  bitget:          'bitget.com',
  gateio:          'gate.io',
  gate:            'gate.io',
  mexc:            'mexc.com',
  bitmart:         'bitmart.com',
  coinex:          'coinex.com',
  novadax:         'novadax.com',
  mercado:         'mercadobitcoin.com.br',
  huobi:           'huobi.com',
  bingx:           'bingx.com',
  htx:             'htx.com',
  bitfinex:        'bitfinex.com',
  bitstamp:        'bitstamp.net',
  poloniex:        'poloniex.com',
  phemex:          'phemex.com',
  lbank:           'lbank.com',
  xt:              'xt.com',
  whitebit:        'whitebit.com',
}

function buildFallbacks(exchange: CatalogExchange): string[] {
  const urls: string[] = []
  if (exchange.logo_url) urls.push(exchange.logo_url)

  const domain = EXCHANGE_DOMAIN[exchange.ccxt_id]
  if (domain) {
    // Google favicon service — muito confiável, retorna PNG de qualidade
    urls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
    // DuckDuckGo como fallback secundário
    urls.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`)
  }
  return urls
}

// Cache em memória: ccxt_id → índice do URL que funcionou
const iconIndexCache = new Map<string, number>()

function ExchangeIcon({ exchange, size = 32 }: { exchange: CatalogExchange; size?: number }) {
  const cacheKey = `${exchange.ccxt_id}::${exchange.logo_url ?? ''}`
  const urls = buildFallbacks(exchange)
  const [idx, setIdx] = useState(() => iconIndexCache.get(cacheKey) ?? 0)

  useEffect(() => {
    const cached = iconIndexCache.get(cacheKey)
    setIdx(cached ?? 0)
  }, [cacheKey])

  const handleError = () => {
    setIdx(i => {
      const next = i + 1
      // Não salva no cache enquanto ainda está tentando fallbacks
      return next
    })
  }

  const handleLoad = () => {
    // Salva o índice que funcionou para não tentar novamente
    iconIndexCache.set(cacheKey, idx)
  }

  const src = urls[idx]

  if (!src) {
    // Marca como "sem ícone" para não tentar de novo (índice alto)
    iconIndexCache.set(cacheKey, 999)
    return (
      <div
        className="rounded-lg bg-muted flex items-center justify-center font-bold text-muted-fore select-none"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {exchange.name.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={src}
      onError={handleError}
      onLoad={handleLoad}
      alt={exchange.name}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: 6 }}
    />
  )
}

// ─── Modal criar/editar ─────────────────────────────────────────────────────

interface ModalProps {
  exchange?: CatalogExchange | null
  onClose: () => void
  onSaved: () => void
}

function ExchangeModal({ exchange, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<ExchangeCatalogInput>({
    name:                   exchange?.name ?? '',
    ccxt_id:                exchange?.ccxt_id ?? '',
    logo_url:               exchange?.logo_url ?? '',
    url:                    exchange?.url ?? '',
    pais_de_origem:         exchange?.pais_de_origem ?? '',
    is_active:              exchange?.is_active ?? true,
    supports_spot:          exchange?.supports_spot ?? true,
    supports_futures:       exchange?.supports_futures ?? false,
    requires_passphrase:    exchange?.requires_passphrase ?? false,
    passphrase_label:       exchange?.passphrase_label ?? '',
    passphrase_placeholder: exchange?.passphrase_placeholder ?? '',
    requires_uid:           exchange?.requires_uid ?? false,
    uid_label:              exchange?.uid_label ?? '',
    uid_placeholder:        exchange?.uid_placeholder ?? '',
    api_key_expiry_days:    exchange?.api_key_expiry_days ?? undefined,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const field = (key: keyof ExchangeCatalogInput) => ({
    value: String(form[key] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  })
  const numField = (key: keyof ExchangeCatalogInput) => ({
    value: form[key] != null ? String(form[key]) : '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value === '' ? undefined : Number(e.target.value) })),
  })
  const check = (key: keyof ExchangeCatalogInput) => ({
    checked: Boolean(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.checked })),
  })

  const submit = async () => {
    if (!form.name.trim() || !form.ccxt_id.trim()) { setError('Nome e CCXT ID são obrigatórios.'); return }
    setSaving(true); setError('')
    try {
      if (exchange) { await apiAdminUpdateExchange(exchange.id, form) }
      else { await apiAdminCreateExchange(form) }
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  const inputCls = 'px-3 py-1.5 text-sm rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-fore outline-none focus:border-primary w-full'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{exchange ? `Editar — ${exchange.name}` : 'Nova Exchange'}</h2>
            <button onClick={onClose} className="text-muted-fore hover:text-foreground"><IonIcon name="close-outline" size={18} /></button>
          </div>
        </CardHeader>
        <CardBody className="overflow-y-auto space-y-4">
          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* Identificação */}
          <div>
            <p className="text-[11px] font-semibold text-muted-fore uppercase tracking-wide mb-2">Identificação</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-fore font-medium">Nome *</span>
                <input {...field('name')} placeholder="Binance" className={inputCls} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-fore font-medium">CCXT ID *</span>
                <input {...field('ccxt_id')} placeholder="binance" className={inputCls + ' font-mono'} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-fore font-medium">País de origem</span>
                <input {...field('pais_de_origem')} placeholder="Brasil" className={inputCls} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-fore font-medium">Expiração API Key (dias)</span>
                <input {...numField('api_key_expiry_days')} type="number" placeholder="90 (MEXC) ou vazio" className={inputCls} />
              </label>
            </div>
          </div>

          {/* URLs */}
          <div>
            <p className="text-[11px] font-semibold text-muted-fore uppercase tracking-wide mb-2">URLs</p>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-fore font-medium">URL do Logo</span>
                <input {...field('logo_url')} placeholder="https://..." className={inputCls} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-fore font-medium">Site</span>
                <input {...field('url')} placeholder="https://binance.com" className={inputCls} />
              </label>
            </div>
          </div>

          {/* Suporte */}
          <div>
            <p className="text-[11px] font-semibold text-muted-fore uppercase tracking-wide mb-2">Suporte a mercados</p>
            <div className="flex flex-wrap gap-4">
              {([
                ['is_active',       'Ativa'],
                ['supports_spot',   'Spot'],
                ['supports_futures','Futuros'],
              ] as const).map(([k, label]) => (
                <label key={k} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
                  <input type="checkbox" {...check(k)} className="accent-primary w-3.5 h-3.5" />{label}
                </label>
              ))}
            </div>
          </div>

          {/* Passphrase */}
          <div>
            <p className="text-[11px] font-semibold text-muted-fore uppercase tracking-wide mb-2">Passphrase</p>
            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none mb-2">
              <input type="checkbox" {...check('requires_passphrase')} className="accent-primary w-3.5 h-3.5" />
              Exige Passphrase
            </label>
            {form.requires_passphrase && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-fore font-medium">Label</span>
                  <input {...field('passphrase_label')} placeholder="Passphrase" className={inputCls} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-fore font-medium">Placeholder</span>
                  <input {...field('passphrase_placeholder')} placeholder="Digite sua passphrase" className={inputCls} />
                </label>
              </div>
            )}
          </div>

          {/* UID */}
          <div>
            <p className="text-[11px] font-semibold text-muted-fore uppercase tracking-wide mb-2">UID / Account ID</p>
            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none mb-2">
              <input type="checkbox" {...check('requires_uid')} className="accent-primary w-3.5 h-3.5" />
              Exige UID / Account ID
            </label>
            {form.requires_uid && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-fore font-medium">Label</span>
                  <input {...field('uid_label')} placeholder="Account ID" className={inputCls} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-fore font-medium">Placeholder</span>
                  <input {...field('uid_placeholder')} placeholder="Digite seu Account ID" className={inputCls} />
                </label>
              </div>
            )}
          </div>
        </CardBody>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={submit} loading={saving}>
            <IonIcon name="save-outline" size={14} /> Salvar
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Detail Panel ──────────────────────────────────────────────────────────

function ExchangeDetail({
  exchange,
  stats,
  onClose,
  onEdit,
  onToggle,
  onDelete,
  working,
}: {
  exchange: CatalogExchange
  stats?: ExchangeStats
  onClose: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
  working: boolean
}) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'CCXT ID',     value: <span className="font-mono text-xs text-foreground">{exchange.ccxt_id}</span> },
    { label: 'País',        value: <span className="text-xs text-foreground">{exchange.pais_de_origem || '—'}</span> },
    { label: 'Site',        value: exchange.url
        ? <a href={exchange.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{exchange.url}</a>
        : <span className="text-muted-fore text-xs">—</span> },
    { label: 'Status',      value: <Badge variant={exchange.is_active ? 'success' : 'default'} size="sm">{exchange.is_active ? 'Ativa' : 'Inativa'}</Badge> },
    { label: 'Spot',        value: <Badge variant={exchange.supports_spot !== false ? 'success' : 'default'} size="sm">{exchange.supports_spot !== false ? 'Sim' : 'Não'}</Badge> },
    { label: 'Futuros',     value: <Badge variant={exchange.supports_futures ? 'info' : 'default'} size="sm">{exchange.supports_futures ? 'Sim' : 'Não'}</Badge> },
    { label: 'Passphrase',  value: exchange.requires_passphrase
        ? <span className="text-xs text-foreground">{[exchange.passphrase_label, exchange.passphrase_placeholder].filter(Boolean).join(' / ') || 'Exigida'}</span>
        : <span className="text-xs text-muted-fore">Não exige</span> },
    { label: 'UID / Account', value: exchange.requires_uid
        ? <span className="text-xs text-foreground">{[exchange.uid_label, exchange.uid_placeholder].filter(Boolean).join(' / ') || 'Exigido'}</span>
        : <span className="text-xs text-muted-fore">Não exige</span> },
    { label: 'Expiração API', value: exchange.api_key_expiry_days
        ? <span className="text-xs text-foreground">{exchange.api_key_expiry_days} dias</span>
        : <span className="text-xs text-muted-fore">Sem expiração</span> },
    { label: 'Usuários',    value: <span className="text-xs font-semibold text-foreground">{stats?.user_count ?? 0}</span> },
    { label: 'Conexões ativas', value: <span className="text-xs font-semibold text-foreground">{stats?.active_count ?? '—'}</span> },
    { label: 'Logo URL',    value: exchange.logo_url
        ? <span className="text-[10px] text-muted-fore break-all leading-tight">{exchange.logo_url}</span>
        : <span className="text-xs text-muted-fore">—</span> },
  ]

  return (
    <div className="w-72 shrink-0 flex flex-col border-l border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-sm font-semibold text-foreground">Detalhes</span>
        <button onClick={onClose} className="text-muted-fore hover:text-foreground">
          <IonIcon name="close-outline" size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="flex flex-col items-center gap-3 px-4 py-5 border-b border-border">
          <ExchangeIcon exchange={exchange} size={60} />
          <div className="text-center">
            <p className="font-bold text-foreground text-base">{exchange.name}</p>
            <p className="text-xs text-muted-fore font-mono mt-0.5">{exchange.ccxt_id}</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="divide-y divide-border">
          {rows.map(r => (
            <div key={r.label} className="flex items-start justify-between px-4 py-2.5 gap-3">
              <span className="text-xs text-muted-fore shrink-0 mt-0.5">{r.label}</span>
              <span className="text-right">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex flex-col gap-2 shrink-0">
        <Button size="sm" variant="secondary" onClick={onEdit} className="w-full justify-center">
          <IonIcon name="create-outline" size={14} /> Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onToggle}
          loading={working}
          className={cn('w-full justify-center', exchange.is_active ? 'hover:text-warning hover:border-warning' : 'hover:text-success hover:border-success')}
        >
          <IonIcon name={exchange.is_active ? 'pause-circle-outline' : 'play-circle-outline'} size={14} />
          {exchange.is_active ? 'Desativar' : 'Ativar'}
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete} className="w-full justify-center">
          <IonIcon name="trash-outline" size={14} /> Remover
        </Button>
      </div>
    </div>
  )
}

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardBody className="flex flex-col items-center gap-4 text-center">
          <IonIcon name="warning-outline" size={36} className="text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Remover exchange?</p>
            <p className="text-sm text-muted-fore mt-1">Tem certeza que deseja remover <strong>{name}</strong> do catálogo?</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" size="sm" className="flex-1" onClick={onCancel}>Cancelar</Button>
            <Button variant="danger" size="sm" className="flex-1" onClick={onConfirm}>
              <IonIcon name="trash-outline" size={14} /> Remover
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function ExchangesPage() {
  const [catalog,  setCatalog]  = useState<CatalogExchange[]>([])
  const [stats,    setStats]    = useState<ExchangeStats[]>([])
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState<'all' | 'active' | 'inactive' | 'connected'>('all')
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'create' | 'edit' | null>(null)
  const [editing,  setEditing]  = useState<CatalogExchange | null>(null)
  const [deleting, setDeleting] = useState<CatalogExchange | null>(null)
  const [working,  setWorking]  = useState<string | null>(null)
  const [detail,   setDetail]   = useState<CatalogExchange | null>(null)

  const load = async () => {
    setLoading(true)
    await Promise.all([
      apiAdminExchangesCatalog().then(d => setCatalog(d.exchanges)).catch(console.error),
      apiAdminExchangeStats().then(d => setStats(d.exchanges)).catch(console.error),
    ])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const statsMap = Object.fromEntries(stats.map(s => [s.exchange_id, s]))

  const displayed = catalog
    .filter(e => {
      if (filter === 'active')    return e.is_active
      if (filter === 'inactive')  return !e.is_active
      if (filter === 'connected') return !!statsMap[e.ccxt_id]
      return true
    })
    .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.ccxt_id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const ua = statsMap[a.ccxt_id]?.user_count ?? 0
      const ub = statsMap[b.ccxt_id]?.user_count ?? 0
      return ub - ua || a.name.localeCompare(b.name)
    })

  const handleToggle = async (e: CatalogExchange) => {
    setWorking(e.id)
    try {
      const res = await apiAdminToggleExchange(e.id)
      setCatalog(prev => prev.map(x => x.id === e.id ? { ...x, is_active: res.is_active } : x))
    } catch (err) { console.error(err) }
    finally { setWorking(null) }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await apiAdminDeleteExchange(deleting.id)
      setCatalog(prev => prev.filter(x => x.id !== deleting.id))
    } catch (err) { console.error(err) }
    finally { setDeleting(null) }
  }

  const openEdit = (e: CatalogExchange) => { setEditing(e); setModal('edit') }
  const closeModal = () => { setModal(null); setEditing(null) }

  return (
    <div className="flex flex-1 gap-0 overflow-hidden min-h-0">
      {/* Main content */}
      <div className="flex-1 space-y-4 overflow-y-auto min-h-0 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-fore">{catalog.length} no catálogo · {stats.length} com usuários conectados</p>
        <Button size="sm" onClick={() => setModal('create')}>
          <IonIcon name="add-outline" size={16} /> Nova Exchange
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total catálogo',        value: catalog.length,                            icon: 'swap-horizontal-outline',  color: 'text-primary' },
          { label: 'Disponíveis aos usuários', value: catalog.filter(e => e.is_active).length, icon: 'checkmark-circle-outline', color: 'text-success' },
          { label: 'Com usuários',          value: stats.length,                              icon: 'people-outline',           color: 'text-warning' },
        ].map(s => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3 py-3">
              <IonIcon name={s.icon} size={22} className={s.color} />
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-fore">{s.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Users per exchange chart */}
      {stats.length > 0 && (() => {
        const chartData = stats
          .slice()
          .sort((a, b) => b.user_count - a.user_count)
          .map(s => {
            const cat = catalog.find(c => c.ccxt_id === s.exchange_id)
            return {
              name:         cat?.name ?? s.name ?? s.exchange_id,
              ccxt_id:      s.exchange_id,
              user_count:   s.user_count,
              active_count: s.active_count ?? 0,
            }
          })
        const totalUsers   = chartData.reduce((acc, d) => acc + d.user_count, 0)
        const totalActive  = chartData.reduce((acc, d) => acc + d.active_count, 0)
        const maxUsers     = Math.max(...chartData.map(d => d.user_count), 1)
        const palette = [
          '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
          '#06b6d4', '#f43f5e', '#84cc16', '#eab308', '#6366f1',
          '#14b8a6', '#ef4444', '#a855f7',
        ]
        return (
          <Card accent>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Usuários por exchange</p>
                  <p className="text-xs text-muted-fore mt-0.5">
                    {totalUsers} conexões · {totalActive} ativas · {chartData.length} exchanges em uso
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ width: '100%', height: Math.max(180, chartData.length * 28 + 40) }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, Math.ceil(maxUsers * 1.15)]}
                      tick={{ fontSize: 10, fill: 'currentColor' }}
                      className="text-muted-fore"
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className="text-muted-fore"
                      width={90}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(127,127,127,0.08)' }}
                      contentStyle={{
                        background: 'var(--card, #1a1a1a)',
                        border: '1px solid var(--border, #2a2a2a)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number, _n, item) => {
                        const d = item?.payload as typeof chartData[0] | undefined
                        return [`${value} usuários${d ? ` (${d.active_count} ativos)` : ''}`, 'Total']
                      }}
                    />
                    <Bar dataKey="user_count" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: 'currentColor' }}>
                      {chartData.map((_d, i) => (
                        <Cell key={i} fill={palette[i % palette.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        )
      })()}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <IonIcon name="search-outline" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fore" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar exchange..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-fore outline-none focus:border-primary w-48"
          />
        </div>
        {(['all', 'active', 'inactive', 'connected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full border font-medium transition-colors',
              filter === f ? 'bg-primary text-white border-primary' : 'border-border text-muted-fore hover:border-primary hover:text-primary'
            )}>
            {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : f === 'inactive' ? 'Inativas' : 'Com usuários'}
          </button>
        ))}
        <span className="text-xs text-muted-fore ml-auto">{displayed.length} exchanges</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-fore gap-2">
          <IonIcon name="swap-horizontal-outline" size={36} className="opacity-30" />
          <p className="text-sm">Nenhuma exchange encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {displayed.map(e => {
            const s = statsMap[e.ccxt_id]
            const isSelected = detail?.id === e.id
            return (
              <div
                key={e.id}
                className={cn('cursor-pointer', isSelected && 'ring-2 ring-primary rounded-xl')}
                onClick={() => setDetail(prev => prev?.id === e.id ? null : e)}
              >
              <Card
                className={cn(
                  'group relative transition-all h-full',
                  !e.is_active && 'opacity-60',
                )}
              >
                <CardBody className="flex flex-col items-center gap-2 py-3 px-2 text-center">
                  <ExchangeIcon exchange={e} size={36} />
                  <div className="w-full">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate">{e.name}</p>
                    <p className="text-[10px] text-muted-fore font-mono">{e.ccxt_id}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {s ? (
                      <Badge variant="info" size="sm">{s.user_count} usuários</Badge>
                    ) : (
                      <Badge variant={e.is_active ? 'success' : 'default'} size="sm">
                        {e.is_active ? 'ativa' : 'inativa'}
                      </Badge>
                    )}
                  </div>
                  {/* Hover actions */}
                  <div
                    className="absolute inset-0 rounded-xl bg-background/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                    onClick={ev => ev.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(e)}
                      className="p-1.5 rounded-lg bg-card border border-border hover:border-primary hover:text-primary text-muted-fore transition-colors"
                      title="Editar"
                    >
                      <IonIcon name="create-outline" size={14} />
                    </button>
                    <button
                      onClick={() => handleToggle(e)}
                      disabled={working === e.id}
                      className={cn(
                        'p-1.5 rounded-lg bg-card border border-border transition-colors text-muted-fore',
                        e.is_active ? 'hover:border-warning hover:text-warning' : 'hover:border-success hover:text-success'
                      )}
                      title={e.is_active ? 'Desativar' : 'Ativar'}
                    >
                      <IonIcon name={e.is_active ? 'pause-circle-outline' : 'play-circle-outline'} size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(e)}
                      className="p-1.5 rounded-lg bg-card border border-border hover:border-destructive hover:text-destructive text-muted-fore transition-colors"
                      title="Remover"
                    >
                      <IonIcon name="trash-outline" size={14} />
                    </button>
                  </div>
                </CardBody>
              </Card>
              </div>
            )
          })}
        </div>
      )}
      </div>

      {/* Detail panel */}
      {detail && (
        <ExchangeDetail
          exchange={detail}
          stats={statsMap[detail.ccxt_id]}
          onClose={() => setDetail(null)}
          onEdit={() => { openEdit(detail) }}
          onToggle={() => handleToggle(detail)}
          onDelete={() => setDeleting(detail)}
          working={working === detail.id}
        />
      )}

      {modal && (
        <ExchangeModal
          exchange={modal === 'edit' ? editing : null}
          onClose={closeModal}
          onSaved={() => { closeModal(); load() }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          name={deleting.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
