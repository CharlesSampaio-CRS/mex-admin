import { parseRolesFromJwtPayload } from '@/lib/jwt'

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

function migrateAuthFromLocalStorage(key: string): void {
  try {
    const legacy = localStorage.getItem(key)
    if (legacy && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, legacy)
      localStorage.removeItem(key)
    }
  } catch {
    // ignore — SSR ou storage bloqueado
  }
}

function getToken(): string | null {
  migrateAuthFromLocalStorage('mex_admin_token')
  return sessionStorage.getItem('mex_admin_token')
}

export function setToken(token: string) {
  sessionStorage.setItem('mex_admin_token', token)
  localStorage.removeItem('mex_admin_token')
}

export function clearToken() {
  sessionStorage.removeItem('mex_admin_token')
  sessionStorage.removeItem('mex_admin_roles')
  localStorage.removeItem('mex_admin_token')
  localStorage.removeItem('mex_admin_roles')
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

  const data = await res.json().catch(() => ({})) as Record<string, unknown>

  if (res.status === 401) {
    clearToken()
    const errCode = typeof data.error === 'string' ? data.error : ''
    const msg =
      errCode === 'SESSION_DISPLACED'
        ? 'Sessão encerrada — sua conta foi acessada em outro dispositivo. Faça login novamente.'
        : errCode === 'LEGACY_TOKEN'
          ? 'Sessão antiga. Faça login novamente.'
          : 'Sessão expirada. Faça login novamente.'
    if (!window.location.pathname.includes('/login')) {
      window.location.assign(window.location.origin + '/admin/login')
    }
    throw new Error(msg)
  }

  if (!res.ok || data.success === false) {
    const err = typeof data.error === 'string' ? data.error : `HTTP_${res.status}`
    const msg =
      typeof data.message === 'string'
        ? data.message
        : typeof data.error === 'string'
          ? data.error
          : `HTTP ${res.status}`
    throw new ApiError(err, msg)
  }
  return data as T
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AdminLoginUser = {
  roles?: string[]
  name?: string
  email?: string
}

export type AdminLoginComplete = {
  otp_required: false
  token: string
  refresh_token?: string
  user: AdminLoginUser
}

export type AdminLoginOtpPending = {
  otp_required: true
  challenge_id: string
  masked_email: string
}

export type AdminLoginResult = AdminLoginComplete | AdminLoginOtpPending

function parseAdminRoles(token: string, user?: AdminLoginUser): string[] {
  let roles: string[] = Array.isArray(user?.roles) ? user.roles : []
  if (!roles.length) {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      ) as Record<string, unknown>
      roles = parseRolesFromJwtPayload(payload)
    } catch { /* ignora */ }
  }
  return roles
}

function finalizeAdminSession(token: string, user: AdminLoginUser) {
  const roles = parseAdminRoles(token, user)
  if (!roles.includes('admin')) {
    throw new Error('Acesso negado — conta sem permissão admin')
  }
  sessionStorage.setItem('mex_admin_roles', JSON.stringify(roles))
  localStorage.removeItem('mex_admin_roles')
  setToken(token)
}

/** Login admin — fetch dedicado (não usa `request()` para evitar redirect 401 no próprio login). */
export async function apiLogin(email: string, password: string): Promise<AdminLoginResult> {
  const res = await fetch(`${BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean
    otp_required?: boolean
    challenge_id?: string
    masked_email?: string
    token?: string
    refresh_token?: string
    error?: string
    message?: string
    user?: AdminLoginUser
  }

  if (!res.ok || data.success === false) {
    const msg =
      typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : `Erro ao entrar (HTTP ${res.status})`
    throw new Error(msg)
  }

  if (data.otp_required && data.challenge_id) {
    return {
      otp_required: true,
      challenge_id: data.challenge_id,
      masked_email: data.masked_email ?? 'seu e-mail',
    }
  }

  if (!data.token) {
    throw new Error('Resposta de login inválida')
  }

  finalizeAdminSession(data.token, data.user ?? { email: email.trim() })

  return {
    otp_required: false,
    token: data.token,
    refresh_token: data.refresh_token,
    user: data.user ?? { email: email.trim() },
  }
}

export async function apiVerifyAdminOtp(
  challengeId: string,
  code: string,
): Promise<AdminLoginComplete> {
  const res = await fetch(`${BASE}/admin/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challenge_id: challengeId, code: code.trim() }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean
    token?: string
    refresh_token?: string
    error?: string
    user?: AdminLoginUser
  }

  if (!res.ok || data.success === false || !data.token) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Código inválido')
  }

  finalizeAdminSession(data.token, data.user ?? {})

  return {
    otp_required: false,
    token: data.token,
    refresh_token: data.refresh_token,
    user: data.user ?? {},
  }
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

export async function apiDeleteUserAndData(userId: string) {
  return request<{ success: boolean }>(`/admin/users/${userId}`, {
    method: 'DELETE',
  })
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

//─ Admin: Security / Audit ──────────────────────────────────────────────────
export interface SecurityEventItem {
  _id?: { $oid: string } | string
  event: string
  user_id: string
  severity: 'critical' | 'warning' | 'info'
  details?: Record<string, unknown>
  user?:  { email?: string; name?: string }
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

export interface SharedCredentialUser {
  id: string
  email?: string | null
  name?: string | null
  created_at?: string | null
  plan?: string | null
  role?: string | null
}

export interface SharedCredentialGroup {
  api_key_hash: string
  user_ids: string[]
  exchange_types: string[]
  emails: string[]
  users?: SharedCredentialUser[]
  count: number
}

export async function apiAdminSharedCredentials() {
  return request<{ success: boolean; count: number; duplicates: SharedCredentialGroup[] }>(
    '/admin/security/duplicates'
  )
}

// ── Admin: Email broadcast ────────────────────────────────────────────────────
export interface SendAdminEmailPayload {
  user_id?: string   // omit = broadcast to all
  subject: string
  html: string
  text: string
}

export async function apiAdminSendEmail(payload: SendAdminEmailPayload) {
  return request<{ success: boolean; sent: number; total: number; errors: string[] }>(
    '/admin/email/send',
    { method: 'POST', body: JSON.stringify(payload) }
  )
}

// ── Admin: App Config / Feature Flags ─────────────────────────────────────────
export interface FeatureFlags {
  ai_chat_enabled:             boolean
  price_alerts_enabled:        boolean
  orders_enabled:              boolean
  strategies_enabled:          boolean
  pix_deposit_enabled:         boolean
  support_attachments_enabled: boolean
  registration_enabled:        boolean
  maintenance_mode:            boolean
  updated_at?: number
  updated_by?: string
}

export async function apiGetAppConfig() {
  return request<{ success: boolean; flags: FeatureFlags }>('/admin/app-config')
}

export async function apiPatchAppConfig(patch: Partial<FeatureFlags>) {
  return request<{ success: boolean; flags: FeatureFlags }>(
    '/admin/app-config',
    { method: 'PATCH', body: JSON.stringify(patch) }
  )
}

