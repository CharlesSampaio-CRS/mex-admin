import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { clearToken, setToken } from '@/lib/api'

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
  return localStorage.getItem('mex_admin_token')
}

function parseJwtPayload(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1]
    const json   = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    return {
      email: payload.email ?? '',
      name:  payload.name  ?? payload.email ?? '',
      roles: payload.roles ?? [],
    }
  } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getRawTokenLocal)
  const [user,  setUser]       = useState<AuthUser | null>(() => {
    const t = getRawTokenLocal()
    return t ? parseJwtPayload(t) : null
  })

  useEffect(() => {
    if (token) {
      setToken(token)
      setUser(parseJwtPayload(token))
    } else {
      clearToken()
      setUser(null)
    }
  }, [token])

  const login = (tok: string, u: AuthUser) => {
    setTokenState(tok)
    setUser(u)
  }

  const logout = () => {
    setTokenState(null)
    setUser(null)
  }

  const isAdmin = user?.roles?.includes('admin') ?? false

  return <Ctx.Provider value={{ user, token, login, logout, isAdmin, isAuthenticated: !!user }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { return useContext(Ctx) }
