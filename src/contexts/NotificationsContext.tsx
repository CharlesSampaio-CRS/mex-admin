/**
 * NotificationsContext
 *
 * Mantém um polling global (30s) de tickets abertos.
 * Quando novos tickets surgem:
 *  - toca um som (duplo bip agradável via Web Audio API)
 *  - empilha notificações no state
 *  - expõe badge count para o Layout
 *
 * Qualquer componente pode:
 *  - ler `unreadCount` para o badge
 *  - ler `notifications` para o painel
 *  - chamar `markAllRead()` ao abrir o painel
 *  - chamar `clearAll()` para limpar
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
import type { SupportTicket } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'new_ticket' | 'new_message'

export interface AdminNotification {
  id:        string          // ticket id
  protocol:  string
  userName:  string
  subject:   string
  preview?:  string          // texto da mensagem (new_message)
  type:      NotificationType
  createdAt: number          // timestamp ms
  read:      boolean
}

interface NotificationsState {
  notifications: AdminNotification[]
  unreadCount:   number
  loading:       boolean
  markAllRead:   () => void
  clearAll:      () => void
  /** Força reload imediato (ex: ao abrir SupportPage) */
  refresh:       () => void
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

    // Dois bips — primeiro mais grave, segundo mais agudo
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
  } catch { /* ignore — Safari private mode, etc. */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<NotificationsState | null>(null)

const POLL_INTERVAL = 30_000 // 30 segundos

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading,       setLoading]       = useState(false)

  // IDs de tickets já vistos — persiste entre polls sem rerender
  const seenIds        = useRef<Set<string>>(new Set())
  // updated_at por ticket para detectar novas mensagens
  const ticketUpdatedAt = useRef<Map<string, number>>(new Map())
  // Flag para não tocar som na primeira carga
  const firstLoad = useRef(true)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiAdminListTickets('open')
      const tickets: SupportTicket[] = data.tickets

      const newOnes: AdminNotification[] = []

      for (const t of tickets) {
        const updatedAt = t.updated_at ?? t.created_at ?? 0

        if (!seenIds.current.has(t.id)) {
          // ── Ticket novo ────────────────────────────────────────────
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
          // ── Ticket existente — checar nova mensagem do usuário ─────
          const prevUpdated = ticketUpdatedAt.current.get(t.id) ?? 0
          const lastComment  = t.comments?.[0]              // lista retorna só o último

          if (
            !firstLoad.current &&
            updatedAt > prevUpdated &&
            lastComment &&
            !lastComment.is_admin    // só notifica se for do usuário, não do admin
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
            // Atualiza silenciosamente (ex: admin respondeu)
            ticketUpdatedAt.current.set(t.id, updatedAt)
          }
        }
      }

      if (newOnes.length > 0) {
        playNewTicketSound()
        setNotifications(prev => [...newOnes, ...prev].slice(0, 50))
      }

      firstLoad.current = false
    } catch { /* silencioso — sem conectividade, etc. */ }
    finally { setLoading(false) }
  }, [])

  // Poll automático
  useEffect(() => {
    fetchTickets()
    const id = setInterval(fetchTickets, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchTickets])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
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
