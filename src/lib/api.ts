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

// ── Admin: Support ────────────────────────────────────────────────────────────
export async function apiAdminListTickets(status = '') {
  const q = new URLSearchParams(status ? { status } : {})
  return request<{ success: boolean; tickets: import('@/types').SupportTicket[] }>(`/support/admin/tickets?${q}`)
}

export async function apiAdminGetTicket(id: string) {
  return request<{ success: boolean; ticket: import('@/types').SupportTicket }>(`/support/admin/tickets/${id}`)
}

export async function apiAdminReplyTicket(id: string, text: string) {
  return request<{ success: boolean; ticket: import('@/types').SupportTicket }>(`/support/admin/tickets/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
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

// ── Admin: Jobs ───────────────────────────────────────────────────────────────
export async function apiAdminJobs() {
  return request<{ success: boolean; jobs: import('@/types').JobStatus[] }>('/admin/jobs')
}

export async function apiAdminTriggerJob(name: string) {
  return request<{ success: boolean }>(`/admin/jobs/${name}/trigger`, { method: 'POST' })
}
