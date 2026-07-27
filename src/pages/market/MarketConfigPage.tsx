import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { IonIcon } from '@/components/ui/IonIcon'
import { cn } from '@/lib/utils'
import {
  apiGetMarketConfig,
  apiPatchMarketConfig,
  apiListMarketTokens,
  apiRunJob,
  type MarketConfig,
  type MarketHealth,
  type MarketPriceSource,
  type MarketTokenItem,
} from '@/lib/api'

const SOURCES: { id: MarketPriceSource; label: string; desc: string }[] = [
  { id: 'coingecko', label: 'CoinGecko', desc: 'Até 1000 tokens · job a cada 5 min' },
  { id: 'coinmarketcap', label: 'CoinMarketCap', desc: 'Até 2500 tokens · requer CMC_API_KEY' },
]

const PAGE_SIZE = 50

function statusColor(status: string) {
  if (status === 'ok') return 'text-emerald-500'
  if (status === 'partial') return 'text-amber-500'
  return 'text-red-500'
}

function fmt(ts?: number | null) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function fmtUsd(n: number) {
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  return `$${n.toPrecision(4)}`
}

function fmtPct(n: number) {
  if (!Number.isFinite(n)) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export function MarketConfigPage() {
  const [config, setConfig] = useState<MarketConfig | null>(null)
  const [health, setHealth] = useState<MarketHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshingJob, setRefreshingJob] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [tokens, setTokens] = useState<MarketTokenItem[]>([])
  const [tokensTotal, setTokensTotal] = useState(0)
  const [tokensPage, setTokensPage] = useState(1)
  const [tokensLoading, setTokensLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await apiGetMarketConfig()
      setConfig(data.config)
      setHealth(data.health)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar configuração de mercado')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTokens = useCallback(async (
    source: MarketPriceSource,
    page: number,
    q: string,
  ) => {
    setTokensLoading(true)
    try {
      const data = await apiListMarketTokens({
        source,
        q: q || undefined,
        page,
        limit: PAGE_SIZE,
      })
      setTokens(data.items)
      setTokensTotal(data.total)
      setTokensPage(data.page)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar tokens do MongoDB')
    } finally {
      setTokensLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setTokensPage(1)
    }, 300)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [search])

  const active = config?.price_source ?? 'coingecko'

  useEffect(() => {
    if (loading) return
    void loadTokens(active, tokensPage, debouncedSearch)
  }, [loading, active, tokensPage, debouncedSearch, loadTokens])

  const selectSource = async (source: MarketPriceSource) => {
    if (!config || config.price_source === source) return
    setSaving(true)
    setError(null)
    setSaved(false)
    setTokensPage(1)
    try {
      const data = await apiPatchMarketConfig(source)
      setConfig(data.config)
      setHealth(data.health)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar fonte')
    } finally {
      setSaving(false)
    }
  }

  const runMarketJob = async () => {
    setRefreshingJob(true)
    setError(null)
    try {
      await apiRunJob('market_quotes_refresh')
      await load()
      await loadTokens(active, tokensPage, debouncedSearch)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao disparar job')
    } finally {
      setRefreshingJob(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(tokensTotal / PAGE_SIZE))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-fore text-sm">
        <IonIcon name="reload-outline" size={18} className="mr-2 animate-spin" />
        Carregando fonte de dados…
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-y-auto flex-1 min-h-0 max-w-4xl">

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/15">
        <IonIcon name="information-circle-outline" size={18} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Fonte de preços do app</p>
          <p className="text-xs text-muted-fore mt-0.5">
            Define qual provedor todos os usuários do app usam para mercado, favoritos e indicadores globais.
            O app exibe apenas o nome da fonte — sem opção de troca.
          </p>
          {config?.updated_at && (
            <p className="text-xs text-muted-fore mt-1.5">
              Última alteração: <span className="font-medium text-foreground">{fmt(config.updated_at)}</span>
              {config.updated_by && <> por <span className="font-medium text-foreground">{config.updated_by}</span></>}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <IonIcon name="alert-circle-outline" size={16} />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
          <IonIcon name="checkmark-circle-outline" size={16} />
          Fonte atualizada — apps recebem na próxima sincronização
        </div>
      )}

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-foreground">Provedor ativo</p>
          <p className="text-xs text-muted-fore">Escolha a fonte global de cotações</p>
        </CardHeader>
        <CardBody className="space-y-2">
          {SOURCES.map(src => {
            const selected = active === src.id
            return (
              <button
                key={src.id}
                type="button"
                disabled={saving}
                onClick={() => void selectSource(src.id)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-colors disabled:opacity-50',
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{src.label}</p>
                    <p className="text-xs text-muted-fore mt-0.5">{src.desc}</p>
                  </div>
                  {selected && (
                    <IonIcon name="checkmark-circle" size={20} className="text-primary shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </CardBody>
      </Card>

      {health && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Saúde dos dados</p>
                <p className="text-xs text-muted-fore">
                  Status geral:{' '}
                  <span className={cn('font-semibold uppercase', statusColor(health.status))}>
                    {health.status}
                  </span>
                </p>
              </div>
              <button
                type="button"
                disabled={refreshingJob}
                onClick={() => void runMarketJob()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50"
              >
                <IonIcon name={refreshingJob ? 'reload-outline' : 'play-outline'} size={14}
                  className={refreshingJob ? 'animate-spin' : ''} />
                {refreshingJob ? 'Rodando…' : 'Refresh job'}
              </button>
            </div>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Tokens CG" value={health.market_tokens.coingecko} />
              <Stat label="Tokens CMC" value={health.market_tokens.cmc} />
              <Stat label="Redis" value={health.redis} />
              <Stat
                label="Fonte ativa"
                value={health.active_source_ready ? 'Pronta' : 'Indisponível'}
                warn={!health.active_source_ready}
              />
            </div>

            {health.active_source_error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                <IonIcon name="warning-outline" size={14} className="mt-0.5 shrink-0" />
                {health.active_source_error}
              </div>
            )}

            {health.last_job && (
              <div className="pt-2 border-t border-border text-xs text-muted-fore space-y-1">
                <p className="font-medium text-foreground">Último job market_quotes_refresh</p>
                <p>Status: <span className="font-medium">{health.last_job.status}</span></p>
                <p>Início: {fmt(health.last_job.started_at)}</p>
                {health.last_job.duration_ms != null && (
                  <p>Duração: {health.last_job.duration_ms} ms</p>
                )}
                {health.last_job.error_msg && (
                  <p className="text-red-500">{health.last_job.error_msg}</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Tokens no MongoDB</p>
              <p className="text-xs text-muted-fore">
                Fonte ativa: <span className="font-medium text-foreground">{active === 'coinmarketcap' ? 'CoinMarketCap' : 'CoinGecko'}</span>
                {tokensTotal > 0 && (
                  <> · {tokensTotal.toLocaleString('pt-BR')} registros</>
                )}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <IonIcon
                name="search-outline"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fore pointer-events-none"
              />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar símbolo, nome ou id…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-fore focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {tokensLoading && tokens.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-fore text-sm">
              <IonIcon name="reload-outline" size={18} className="mr-2 animate-spin" />
              Carregando tokens…
            </div>
          ) : tokens.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-fore">
              {debouncedSearch
                ? `Nenhum token encontrado para "${debouncedSearch}"`
                : 'Nenhum token na collection market_tokens para esta fonte'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-muted-fore">
                    <th className="px-4 py-2.5 font-medium w-12">#</th>
                    <th className="px-4 py-2.5 font-medium">Token</th>
                    <th className="px-4 py-2.5 font-medium text-right">Preço</th>
                    <th className="px-4 py-2.5 font-medium text-right">24h</th>
                    <th className="px-4 py-2.5 font-medium text-right hidden sm:table-cell">Market cap</th>
                    <th className="px-4 py-2.5 font-medium text-right hidden md:table-cell">Volume</th>
                    <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Atualizado</th>
                  </tr>
                </thead>
                <tbody className={cn(tokensLoading && 'opacity-50')}>
                  {tokens.map(token => (
                    <TokenRow key={`${token.coin_id}-${token.symbol}`} token={token} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tokensTotal > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border text-xs">
              <span className="text-muted-fore">
                Página {tokensPage}/{totalPages} · {tokensTotal.toLocaleString('pt-BR')} tokens
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={tokensPage <= 1 || tokensLoading}
                  onClick={() => setTokensPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={tokensPage >= totalPages || tokensLoading}
                  onClick={() => setTokensPage(p => p + 1)}
                  className="px-2.5 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 border border-border">
      <p className="text-[10px] uppercase tracking-wide text-muted-fore">{label}</p>
      <p className={cn('text-sm font-semibold mt-0.5', warn && 'text-amber-500')}>{value}</p>
    </div>
  )
}

function TokenIcon({ src, symbol, size = 28 }: { src?: string | null; symbol: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div
        className="rounded-full bg-muted flex items-center justify-center font-bold text-[10px] text-muted-fore shrink-0 uppercase"
        style={{ width: size, height: size }}
      >
        {symbol.slice(0, 2)}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      className="rounded-full shrink-0 object-cover bg-muted"
      onError={() => setFailed(true)}
    />
  )
}

function TokenRow({ token }: { token: MarketTokenItem }) {
  const changeColor = token.change24h > 0
    ? 'text-emerald-500'
    : token.change24h < 0
      ? 'text-red-500'
      : 'text-muted-fore'

  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-muted/30">
      <td className="px-4 py-2.5 text-muted-fore tabular-nums">
        {token.rank ?? '—'}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <TokenIcon src={token.image} symbol={token.symbol} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground">{token.symbol}</span>
              {token.stale && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 font-medium">
                  stale
                </span>
              )}
            </div>
            <p className="text-xs text-muted-fore truncate max-w-[200px] sm:max-w-xs" title={token.name}>
              {token.name}
            </p>
            <p className="text-[10px] text-muted-fore/70 font-mono truncate max-w-[200px] sm:max-w-xs" title={token.coin_id}>
              {token.coin_id}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5 text-right font-medium tabular-nums whitespace-nowrap">
        {fmtUsd(token.price)}
      </td>
      <td className={cn('px-4 py-2.5 text-right font-medium tabular-nums whitespace-nowrap', changeColor)}>
        {fmtPct(token.change24h)}
      </td>
      <td className="px-4 py-2.5 text-right text-muted-fore tabular-nums whitespace-nowrap hidden sm:table-cell">
        {fmtUsd(token.market_cap)}
      </td>
      <td className="px-4 py-2.5 text-right text-muted-fore tabular-nums whitespace-nowrap hidden md:table-cell">
        {fmtUsd(token.volume24h)}
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-fore whitespace-nowrap hidden lg:table-cell">
        {fmt(token.quotes_updated_at)}
      </td>
    </tr>
  )
}
