/**
 * NotificationsContext
 *
 * Mantém um polling global (30s) de tickets abertos.
 * Notificações são persistidas em localStorage — sobrevivem a reload/navegação.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { apiAdminListTickets } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { SupportTicket } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'new_ticket' | 'new_message'

export interface AdminNotification {
  id:        string
  protocol:  string
  userName:  string
  subject:   string
  preview?:  string
  type:      NotificationType
  createdAt: number
  read:      boolean
}

interface NotificationsState {
  notifications: AdminNotification[]
  unreadCount:   number
  loading:       boolean
  markAllRead:   () => void
  clearAll:      () => void
  refresh:       () => void
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_KEY = 'mex_admin_notifications'

function loadFromStorage(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AdminNotification[]
    const cutoff = Date.now() - 7 * 24 * 3_600_000
    return parsed.filter(n => n.createdAt > cutoff)
  } catch { return [] }
}

function saveToStorage(notifications: AdminNotification[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(notifications.slice(0, 50)))
  } catch { /* quota exceeded */ }
}

// ─── Sound ───────────────────────────────────────────────────────────────────

function playNewTicketSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx  = new AudioCtx()
    const gain = ctx.createGain()
    gain.connect(ctx.destination)

    const beep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      osc.connect(gain)
      osc.type            = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    beep(660, 0,    0.18)
    beep(880, 0.22, 0.22)
  } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<NotificationsState | null>(null)

const POLL_INTERVAL = 30_000

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(loadFromStorage)
  const [loading,       setLoading]       = useState(false)

  const { isAuthenticated } = useAuth()

  const seenIds         = useRef<Set<string>>(new Set())
  const ticketUpdatedAt = useRef<Map<string, number>>(new Map())
  const firstLoad       = useRef(true)

  // Persiste sempre que muda
  useEffect(() => {
    saveToStorage(notifications)
  }, [notifications])

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiAdminListTickets('open')
      const tickets: SupportTicket[] = data.tickets

      const newOnes: AdminNotification[] = []

      for (const t of tickets) {
        const updatedAt = t.updated_at ?? t.created_at ?? 0

        if (!seenIds.current.has(t.id)) {
          seenIds.current.add(t.id)
          ticketUpdatedAt.current.set(t.id, updatedAt)

          if (!firstLoad.current) {
            newOnes.push({
              id:        t.id,
              protocol:  t.protocol ?? t.id.slice(-6).toUpperCase(),
              userName:  t.name ?? t.email ?? 'Usuário',
              subject:   t.subject_label ?? 'Sem assunto',
              type:      'new_ticket',
              createdAt: updatedAt,
              read:      false,
            })
          }
        } else {
          const prevUpdated = ticketUpdatedAt.current.get(t.id) ?? 0
          const lastComment = t.comments?.[0]

          if (
            !firstLoad.current &&
            updatedAt > prevUpdated &&
            lastComment &&
            !lastComment.is_admin
          ) {
            ticketUpdatedAt.current.set(t.id, updatedAt)
            newOnes.push({
              id:        t.id,
              protocol:  t.protocol ?? t.id.slice(-6).toUpperCase(),
              userName:  t.name ?? t.email ?? 'Usuário',
              subject:   t.subject_label ?? 'Sem assunto',
              preview:   lastComment.text.slice(0, 80),
              type:      'new_message',
              createdAt: updatedAt,
              read:      false,
            })
          } else {
            ticketUpdatedAt.current.set(t.id, updatedAt)
          }
        }
      }

      if (newOnes.length > 0) {
        playNewTicketSound()
        setNotifications(prev => {
          const existingKeys = new Set(prev.map(n => `${n.id}-${n.createdAt}`))
          const unique = newOnes.filter(n => !existingKeys.has(`${n.id}-${n.createdAt}`))
          return [...unique, ...prev].slice(0, 50)
        })
      }

      firstLoad.current = false
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return   // don't poll until logged in
    firstLoad.current = true       // reset on every login
    fetchTickets()
    const id = setInterval(fetchTickets, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchTickets, isAuthenticated])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    saveToStorage([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Ctx.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAllRead,
      clearAll,
      refresh: fetchTickets,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useNotifications(): NotificationsState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider')
  return ctx
}
