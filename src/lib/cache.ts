/**
 * Cache leve em localStorage para dados do admin.
 * Estratégia "stale-while-revalidate": retorna dado em cache imediatamente
 * no F5 (elimina pisca), e busca a versão fresca em background.
 */

const PREFIX = 'mex_admin_cache_'
const DEFAULT_TTL_MS = 1000 * 60 * 10 // 10 min

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { v, t } = JSON.parse(raw) as { v: T; t: number }
    if (Date.now() - t > DEFAULT_TTL_MS) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return v
  } catch {
    return null
  }
}

export function cacheSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ v: value, t: Date.now() }))
  } catch {
    /* quota exceeded, ignora */
  }
}

/**
 * Hook-like helper: executa fetcher e devolve `(cached, fresh)`.
 * Uso típico:
 *   const cached = cacheGet<Stats>('dashboard')
 *   const [stats, setStats] = useState(cached)
 *   useEffect(() => { apiFetch().then(s => { setStats(s); cacheSet('dashboard', s) }) }, [])
 */
