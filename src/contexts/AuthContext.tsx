import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { clearToken, setToken } from '@/lib/api'
import { parseJwtPayload } from '@/lib/jwt'

const ROLES_KEY = 'mex_admin_roles'

interface AuthUser {
  email: string
  name:  string
  roles: string[]
}

interface AuthCtx {
  user:            AuthUser | null
  token:           string | null
  login:           (token: string, user: AuthUser) => void
  logout:          () => void
  isAdmin:         boolean
  isAuthenticated: boolean
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

function getRawTokenLocal() {
  try {
    const legacy = localStorage.getItem('mex_admin_token')
    if (legacy && !sessionStorage.getItem('mex_admin_token')) {
      sessionStorage.setItem('mex_admin_token', legacy)
      localStorage.removeItem('mex_admin_token')
    }
  } catch { /* ignore */ }
  return sessionStorage.getItem('mex_admin_token')
}

function loadStoredRoles(): string[] {
  try {
    const legacy = localStorage.getItem(ROLES_KEY)
    if (legacy && !sessionStorage.getItem(ROLES_KEY)) {
      sessionStorage.setItem(ROLES_KEY, legacy)
      localStorage.removeItem(ROLES_KEY)
    }
    const raw = sessionStorage.getItem(ROLES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function saveStoredRoles(roles: string[]) {
  sessionStorage.setItem(ROLES_KEY, JSON.stringify(roles))
  localStorage.removeItem(ROLES_KEY)
}

function clearStoredRoles() {
  sessionStorage.removeItem(ROLES_KEY)
  localStorage.removeItem(ROLES_KEY)
}

/** Roles: JWT (custom:roles) → cache local (login API) → vazio */
function resolveRoles(jwtRoles: string[], fallback?: string[]): string[] {
  if (jwtRoles.includes('admin')) return jwtRoles
  const stored = loadStoredRoles()
  if (stored.includes('admin')) return stored
  if (fallback?.includes('admin')) return fallback
  return jwtRoles.length ? jwtRoles : stored
}

function tokenToUser(token: string, fallbackRoles?: string[]): AuthUser | null {
  const p = parseJwtPayload(token)
  if (!p) return null
  const roles = resolveRoles(p.roles, fallbackRoles)
  return { email: p.email, name: p.name, roles }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getRawTokenLocal)
  const [user,  setUser]       = useState<AuthUser | null>(() => {
    const t = getRawTokenLocal()
    return t ? tokenToUser(t) : null
  })

  useEffect(() => {
    if (token) {
      setToken(token)
      setUser(prev => {
        const parsed = tokenToUser(token, prev?.roles)
        if (!parsed) return null
        return parsed
      })
    } else {
      clearToken()
      clearStoredRoles()
      setUser(null)
    }
  }, [token])

  const login = (tok: string, u: AuthUser) => {
    saveStoredRoles(u.roles)
    setToken(tok)
    setTokenState(tok)
    setUser(u)
  }

  const logout = () => {
    setTokenState(null)
    setUser(null)
    clearStoredRoles()
  }

  const isAdmin = user?.roles?.includes('admin') ?? false

  return (
    <Ctx.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin,
        isAuthenticated: !!token && isAdmin,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { return useContext(Ctx) }
