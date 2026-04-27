/**
 * NotificationsPanel
 *
 * Sininho no topbar com badge de não-lidos.
 * Ao clicar abre um dropdown com a lista de notificações recentes.
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate }                 from 'react-router-dom'
import { IonIcon }                     from '@/components/ui/IonIcon'
import { useNotifications }            from '@/contexts/NotificationsContext'
import type { AdminNotification }      from '@/contexts/NotificationsContext'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000)        return 'agora'
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}min atrás`
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}h atrás`
  return `${Math.floor(diff / 86_400_000)}d atrás`
}

export function NotificationsPanel() {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panelRef        = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function handleOpen() {
    setOpen(o => !o)
    if (!open) markAllRead()
  }

  function handleGoToTicket(n: AdminNotification) {
    setOpen(false)
    navigate('/support', { state: { openTicketId: n.id } })
  }

  return (
    <div className="relative" ref={panelRef}>

      {/* ── Botão sininho ─────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="group relative w-8 h-8 flex items-center justify-center rounded-lg
                   hover:bg-muted transition-colors"
        title="Notificações de suporte"
      >
        <IonIcon
          name={open ? 'notifications' : 'notifications-outline'}
          size={17}
          className={unreadCount > 0
            ? 'text-amber-400'
            : 'text-muted-fore group-hover:text-foreground transition-colors'}
        />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1
                           bg-red-500 text-white text-[10px] font-bold rounded-full
                           flex items-center justify-center leading-none
                           ring-2 ring-background animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Painel dropdown ───────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 top-10 w-80 z-50
                        bg-sidebar border border-border rounded-2xl shadow-2xl shadow-black/30
                        overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-border">
            <div className="flex items-center gap-2">
              <IonIcon name="notifications-outline" size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">Notificações</span>
              {notifications.length > 0 && (
                <span className="text-[11px] bg-muted text-muted-fore px-1.5 py-0.5 rounded-full font-medium">
                  {notifications.length}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] text-muted-fore hover:text-foreground
                           transition-colors flex items-center gap-1"
              >
                <IonIcon name="trash-outline" size={11} />
                Limpar
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[340px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-fore">
                <IonIcon name="checkmark-circle-outline" size={32} className="opacity-30" />
                <p className="text-xs">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleGoToTicket(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50
                              hover:bg-muted transition-colors flex gap-3 items-start
                              ${n.read ? 'opacity-60' : ''}`}
                >
                  {/* Ícone */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                                   flex-shrink-0 mt-0.5
                                   ${n.read
                                     ? 'bg-muted text-muted-fore'
                                     : n.type === 'new_message'
                                       ? 'bg-blue-500/15 text-blue-400'
                                       : 'bg-amber-500/15 text-amber-400'}`}>
                    <IonIcon
                      name={n.type === 'new_message' ? 'chatbubble-outline' : 'headset-outline'}
                      size={15}
                    />
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-foreground truncate flex-1">
                        {n.userName}
                      </span>
                      {!n.read && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0
                          ${n.type === 'new_message' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                      )}
                    </div>
                    {/* Label do tipo */}
                    <p className={`text-[10px] font-semibold mb-0.5
                      ${n.type === 'new_message' ? 'text-blue-400' : 'text-amber-400'}`}>
                      {n.type === 'new_message' ? '💬 Nova mensagem' : '🎫 Novo ticket'}
                    </p>
                    <p className="text-xs text-muted-fore truncate mb-0.5">{n.subject}</p>
                    {/* Preview da mensagem */}
                    {n.type === 'new_message' && n.preview && (
                      <p className="text-[11px] text-foreground/70 truncate italic mb-1">
                        "{n.preview}"
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-primary/10 text-primary
                                       px-1.5 py-0.5 rounded-md font-mono font-medium">
                        #{n.protocol}
                      </span>
                      <span className="text-[10px] text-muted-fore">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  <IonIcon name="chevron-forward-outline" size={12}
                    className="text-muted-fore flex-shrink-0 mt-1.5" />
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/30">
            <button
              onClick={() => { setOpen(false); navigate('/support') }}
              className="w-full flex items-center justify-center gap-1.5
                         text-xs text-primary hover:text-primary/80
                         font-semibold transition-colors py-0.5"
            >
              <IonIcon name="headset-outline" size={12} />
              Ver todos os tickets
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
