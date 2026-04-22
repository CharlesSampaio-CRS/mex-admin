const BASE = '/api/v1'

export class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem('mex_admin_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('mex_admin_device_id', id)
  }
  return id
}

export function getDeviceId(): string {
  return getOrCreateDeviceId()
}

function getToken(): string | null {
  return localStorage.getItem('mex_admin_token')
}

export function setToken(token: string) {
  localStorage.setItem('mex_admin_token', token)
}

export function clearToken() {
  localStorage.removeItem('mex_admin_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    clearToken()
    window.location.reload()
    throw new Error('Unauthorized')
  }

  const data = await res.json()

  // Trata erro mesmo quando status é 200 mas success=false
  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.error ?? `HTTP_${res.status}`, data?.message ?? data?.error ?? `HTTP ${res.status}`)
  }
  return data as T
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiLogin(email: string, password: string) {
  const data = await request<{ token: string; user?: { roles?: string[] } }>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, device_id: getDeviceId() }),
  })

  // Extrai roles do payload JWT caso a API não retorne user.roles
  let roles: string[] = data.user?.roles ?? []
  if (!roles.length && data.token) {
    try {
      const payload = JSON.parse(atob(data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      roles = payload.roles ?? payload.role ?? payload.permissions ?? []
    } catch { /* ignora */ }
  }

  if (!roles.includes('admin')) throw new Error('Acesso negado — conta sem permissão admin')
  setToken(data.token)
  return { token: data.token, user: { roles } }
}

// ── Admin: Dashboard ──────────────────────────────────────────────────────────
export async function apiDashboardStats() {
  return request<{ success: boolean; stats: import('@/types').DashboardStats }>('/admin/dashboard')
}

// ── Admin: Users ──────────────────────────────────────────────────────────────
export async function apiListUsers(page = 1, search = '', plan = '') {
  const q = new URLSearchParams({ page: String(page), ...(search && { search }), ...(plan && { plan }) })
  return request<{ success: boolean; users: import('@/types').AdminUser[]; total: number }>(`/admin/users?${q}`)
}

export async function apiGetUser(userId: string) {
  return request<{ success: boolean; user: import('@/types').AdminUser }>(`/admin/users/${userId}`)
}

export async function apiUpdateUserPlan(userId: string, plan: string) {
  return request<{ success: boolean }>(`/admin/users/${userId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({ plan }),
  })
}

export async function apiPatchUser(userId: string, data: { name?: string; email?: string; roles?: string[]; is_active?: boolean; email_verified?: boolean }) {
  return request<{ success: boolean }>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function apiBlockUser(userId: string) {
  return request<{ success: boolean }>(`/admin/users/${userId}/block`, { method: 'POST' })
}

export async function apiUnblockUser(userId: string) {
  return request<{ success: boolean }>(`/admin/users/${userId}/unblock`, { method: 'POST' })
}

// ── Admin: Support ────────────────────────────────────────────────────────────
export async function apiAdminListTickets(status = '') {
  const q = new URLSearchParams(status ? { status } : {})
  return request<{ success: boolean; tickets: import('@/types').SupportTicket[] }>(`/support/admin/tickets?${q}`)
}

export async function apiAdminGetTicket(id: string) {
  return request<{ success: boolean; ticket: import('@/types').SupportTicket }>(`/support/admin/tickets/${id}`)
}

export async function apiAdminReplyTicket(id: string, text: string, attachments?: string[]) {
  return request<{ success: boolean; ticket: import('@/types').SupportTicket }>(`/support/admin/tickets/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text, ...(attachments?.length ? { attachments } : {}) }),
  })
}

export async function apiAdminUpdateStatus(id: string, status: string) {
  return request<{ success: boolean; ticket: import('@/types').SupportTicket }>(`/support/admin/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// ── Admin: Exchanges ──────────────────────────────────────────────────────────
export async function apiAdminExchangeStats() {
  return request<{ success: boolean; exchanges: import('@/types').ExchangeStats[] }>('/admin/exchanges')
}

export async function apiAdminAllExchanges() {
  return request<{ success: boolean; exchanges: import('@/types').CatalogExchange[] }>('/exchanges/available')
}

export async function apiAdminExchangesCatalog() {
  return request<{ success: boolean; exchanges: import('@/types').CatalogExchange[] }>('/admin/exchanges/catalog')
}

export interface ExchangeCatalogInput {
  name: string
  ccxt_id: string
  logo_url?: string
  url?: string
  pais_de_origem?: string
  is_active?: boolean
  supports_spot?: boolean
  supports_futures?: boolean
  requires_passphrase?: boolean
  passphrase_label?: string
  passphrase_placeholder?: string
  requires_uid?: boolean
  uid_label?: string
  uid_placeholder?: string
  api_key_expiry_days?: number
}

export async function apiAdminCreateExchange(data: ExchangeCatalogInput) {
  return request<{ success: boolean; id: string }>('/admin/exchanges/catalog', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiAdminUpdateExchange(id: string, data: ExchangeCatalogInput) {
  return request<{ success: boolean }>(`/admin/exchanges/catalog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiAdminToggleExchange(id: string) {
  return request<{ success: boolean; is_active: boolean }>(`/admin/exchanges/catalog/${id}/toggle`, {
    method: 'PATCH',
  })
}

export async function apiAdminDeleteExchange(id: string) {
  return request<{ success: boolean }>(`/admin/exchanges/catalog/${id}`, {
    method: 'DELETE',
  })
}

// ── Admin: Jobs ───────────────────────────────────────────────────────────────
export async function apiAdminJobs() {
  return request<{ success: boolean; jobs: import('@/types').JobStatus[] }>('/admin/jobs')
}

export async function apiAdminTriggerJob(name: string) {
  return request<{ success: boolean }>(`/admin/jobs/${name}/run`, { method: 'POST' })
}

export async function apiAdminJobExecutions(jobName?: string) {
  const path = jobName ? `/admin/jobs/${jobName}/executions` : '/admin/jobs/executions'
  return request<{ success: boolean; executions: import('@/types').JobExecution[]; total: number }>(path)
}

// ── Admin: Push ───────────────────────────────────────────────────────────────
export async function apiAdminSendPush(payload: { title: string; body: string; userIds?: string[]; plan?: string }) {
  return request<{ success: boolean; sent: number; failed: number }>('/admin/push/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Admin: Security / Audit ──────────────────────────────────────────────────
export interface SecurityEventItem {
  _id?: { $oid: string } | string
  event: string
  user_id: string
  severity: 'critical' | 'warning' | 'info'
  details?: Record<string, unknown>
  created_at: string | { $date: string | { $numberLong: string } }
}

export interface BackfillReport {
  scanned_users: number
  scanned_exchanges: number
  backfilled: number
  already_had_proof: number
  decrypt_failures: number
  update_failures: number
}

export async function apiAdminSecurityEvents(params: { user_id?: string; event?: string; limit?: number } = {}) {
  const q = new URLSearchParams()
  if (params.user_id) q.set('user_id', params.user_id)
  if (params.event)   q.set('event', params.event)
  if (params.limit)   q.set('limit', String(params.limit))
  const qs = q.toString()
  return request<{ success: boolean; count: number; events: SecurityEventItem[] }>(
    `/admin/security/events${qs ? `?${qs}` : ''}`
  )
}

export async function apiAdminBackfillOwnerProofs() {
  return request<{ success: boolean; report: BackfillReport }>(
    '/admin/security/backfill-owner-proofs',
    { method: 'POST' }
  )
}

export interface SharedCredentialGroup {
  api_key_hash: string
  user_ids: string[]
  exchange_types: string[]
  emails: string[]
  count: number
}

export async function apiAdminSharedCredentials() {
  return request<{ success: boolean; count: number; duplicates: SharedCredentialGroup[] }>(
    '/admin/security/duplicates'
  )
}
