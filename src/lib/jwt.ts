/** Extrai roles do payload do ID token Cognito (custom:roles é JSON string). */
export function parseRolesFromJwtPayload(payload: Record<string, unknown>): string[] {
  const raw =
    payload['custom:roles'] ??
    payload.roles ??
    payload.role ??
    payload.permissions

  if (Array.isArray(raw)) {
    return raw.map(String)
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      if (raw === 'admin') return ['admin']
    }
  }
  return []
}

export function parseJwtPayload(token: string): {
  email: string
  name: string
  roles: string[]
} | null {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as Record<string, unknown>
    const roles = parseRolesFromJwtPayload(payload)
    const email = String(payload.email ?? payload['cognito:username'] ?? '')
    const name = String(payload.name ?? email)
    return { email, name, roles }
  } catch {
    return null
  }
}
