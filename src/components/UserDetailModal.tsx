import { useState } from 'react'
import { formatDate, planColor, planLabel, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import { ExchangeLogo } from '@/components/ui/ExchangeLogo'
import { apiUpdateUserPlan, apiBlockUser, apiUnblockUser } from '@/lib/api'
import type { AdminUser } from '@/types'

const PLANS = ['free', 'pro', 'premium'] as const

interface Props {
  user: AdminUser
  onClose: () => void
  onUserUpdated: (updated: AdminUser) => void
}

function Avatar({ user }: { user: AdminUser }) {
  const [failed, setFailed] = useState(false)
  const initials = (user.name?.charAt(0) ?? user.email.charAt(0)).toUpperCase()
  if (user.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt={user.name || user.email}
        className="w-14 h-14 rounded-full object-cover shrink-0"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xl font-bold uppercase shrink-0">
      {initials}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-muted-fore uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value, mono }: { icon: string; label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
      <IonIcon name={icon} size={14} className="text-gray-400 shrink-0" />
      <span className="text-xs text-muted-fore w-28 shrink-0">{label}</span>
      <span className={cn('text-xs text-gray-800 dark:text-gray-200 break-all flex-1', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

export function UserDetailModal({ user, onClose, onUserUpdated }: Props) {
  const [loading,     setLoading]     = useState(false)
  const [planLoading, setPlanLoading] = useState(false)

  const handlePlan = async (newPlan: string) => {
    if (newPlan === user.subscription_plan) return
    setPlanLoading(true)
    try {
      await apiUpdateUserPlan(user.user_id, newPlan)
      onUserUpdated({ ...user, subscription_plan: newPlan as AdminUser['subscription_plan'] })
    } catch (e) { console.error(e) }
    finally { setPlanLoading(false) }
  }

  const handleToggleBlock = async () => {
    setLoading(true)
    try {
      if (isActive) {
        await apiBlockUser(user.user_id)
        onUserUpdated({ ...user, is_active: false })
      } else {
        await apiUnblockUser(user.user_id)
        onUserUpdated({ ...user, is_active: true })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const isActive = user.is_active ?? true

  const flags = [
    { label: 'E-mail verificado', ok: !!user.is_verified },
    { label: 'Conta ativa',       ok: isActive },
    { label: 'TOTP ativado',      ok: !!(user as any).totp_enabled },
    { label: 'Termos aceitos',    ok: !!(user as any).terms_accepted },
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer direito */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl flex flex-col bg-card shadow-2xl border-l border-border overflow-hidden">

        {/* ── Top bar ── */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
          >
            <IonIcon name="arrow-back-outline" size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1">Detalhes do usuário</span>
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
            isActive ? 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-400/15 text-red-600 dark:text-red-400'
          )}>
            {isActive ? 'Ativo' : 'Bloqueado'}
          </span>
        </div>

        {/* ── Scroll ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Perfil */}
          <div className="px-5 py-5 border-b border-border flex items-center gap-4">
            <Avatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-foreground truncate">{user.name || '—'}</p>
              <p className="text-xs text-muted-fore truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide',
                  planColor(user.subscription_plan)
                )}>
                  {planLabel(user.subscription_plan)}
                </span>
                {user.is_verified && (
                  <span className="text-[10px] font-medium text-sky-500 flex items-center gap-0.5">
                    <IonIcon name="checkmark-circle" size={12} /> Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-6">

            {/* Exchanges */}
            <Section title={`Exchanges conectadas (${user.exchange_count ?? 0})`}>
              {user.exchanges && user.exchanges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.exchanges.map(ex => (
                    <div key={ex} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-border">
                      <ExchangeLogo exchangeId={ex} name={ex} size={16} />
                      <span className="text-xs font-medium text-gray-700 text-muted-fore capitalize">{ex}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Nenhuma exchange conectada</p>
              )}
            </Section>

            {/* Informações */}
            <Section title="Informações">
              <div className="rounded-xl border border-border bg-gray-50 bg-muted px-3">
                <InfoRow icon="calendar-outline"       label="Cadastro"        value={user.created_at ? formatDate(user.created_at) : null} />
                <InfoRow icon="time-outline"           label="Último login"    value={(user as any).last_login ? formatDate((user as any).last_login) : null} />
                <InfoRow icon="globe-outline"          label="IP"              value={(user as any).last_login_ip} mono />
                <InfoRow icon="phone-portrait-outline" label="Dispositivo"     value={(user as any).last_login_device} />
                <InfoRow icon="key-outline"            label="Provider"        value={(user as any).provider} />
                <InfoRow icon="hourglass-outline"      label="Plano expira"    value={user.subscription_expires_at ? formatDate(user.subscription_expires_at) : null} />
                <InfoRow icon="notifications-outline"  label="Push token"      value={user.expo_push_token} mono />
              </div>
            </Section>

            {/* Flags */}
            <Section title="Status & Segurança">
              <div className="grid grid-cols-2 gap-1.5">
                {flags.map(f => (
                  <div key={f.label} className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border',
                    f.ok
                      ? 'bg-emerald-50 dark:bg-emerald-400/5 border-emerald-100 dark:border-emerald-400/15 text-emerald-700 dark:text-emerald-400'
                      : 'bg-gray-50 bg-muted border-border text-gray-400'
                  )}>
                    <IonIcon name={f.ok ? 'checkmark-circle-outline' : 'ellipse-outline'} size={13} />
                    {f.label}
                  </div>
                ))}
              </div>
            </Section>

            {/* Ações */}
            <Section title="Ações">
              <div className="space-y-3">
                {/* Plano */}
                <div>
                  <p className="text-xs text-muted-fore mb-1.5">Alterar plano</p>
                  <div className="flex gap-2">
                    {PLANS.map(p => (
                      <button
                        key={p}
                        disabled={planLoading}
                        onClick={() => handlePlan(p)}
                        className={cn(
                          'flex-1 py-2 text-xs font-semibold rounded-lg border transition-all',
                          user.subscription_plan === p
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'border-border bg-white dark:bg-white/5 text-muted-fore hover:border-primary/60 hover:text-primary',
                          planLoading && 'opacity-50 cursor-wait'
                        )}
                      >
                        {planLabel(p)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bloquear / Desbloquear */}
                <Button
                  variant="secondary"
                  size="sm"
                  loading={loading}
                  onClick={handleToggleBlock}
                  className={cn(
                    'w-full justify-center font-medium',
                    isActive
                      ? 'text-red-500 border-red-200 dark:border-red-400/25 hover:bg-red-50 dark:hover:bg-red-400/10'
                      : 'text-emerald-600 border-emerald-200 dark:border-emerald-400/25 hover:bg-emerald-50 dark:hover:bg-emerald-400/10'
                  )}
                >
                  <IonIcon name={isActive ? 'ban-outline' : 'checkmark-circle-outline'} size={14} />
                  {isActive ? 'Bloquear conta' : 'Desbloquear conta'}
                </Button>
              </div>
            </Section>

            {/* ID */}
            <p className="text-[10px] font-mono text-gray-300 dark:text-gray-700 break-all select-all pb-2">
              {user.user_id}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
