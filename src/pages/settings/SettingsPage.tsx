import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { getDeviceId } from '@/lib/api'

function Section({ icon, title, description, children }: {
  icon: string; title: string; description: string; children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <IonIcon name={icon} size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-fore">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-fore mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()

  // Notificações
  const [notifTicket,  setNotifTicket]  = useState(true)
  const [notifUser,    setNotifUser]    = useState(false)
  const [notifJob,     setNotifJob]     = useState(true)

  // Segurança
  const [copied, setCopied] = useState(false)
  const deviceId = getDeviceId()

  const copyDeviceId = () => {
    navigator.clipboard.writeText(deviceId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearSession = () => {
    localStorage.removeItem('mex_admin_token')
    localStorage.removeItem('mex_admin_device_id')
    window.location.reload()
  }

  return (
    <div className="space-y-6 overflow-y-auto flex-1 min-h-0">
      {/* Perfil */}
      <Section icon="person-outline" title="Perfil" description="Informações da conta logada">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg uppercase shrink-0">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{user?.name || 'Admin'}</p>
            <p className="text-sm text-muted-fore truncate">{user?.email}</p>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {user?.roles?.map(r => (
                <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Aparência */}
      <Section icon="color-palette-outline" title="Aparência" description="Tema do painel">
        <Toggle
          checked={theme === 'dark'}
          onChange={toggle}
          label="Modo escuro"
          description="Alterna entre tema claro e escuro"
        />
      </Section>

      {/* Notificações */}
      <Section icon="notifications-outline" title="Notificações" description="Alertas exibidos no painel">
        <Toggle checked={notifTicket} onChange={setNotifTicket} label="Novos tickets de suporte" description="Alerta ao abrir um novo ticket" />
        <Toggle checked={notifUser}   onChange={setNotifUser}   label="Novos usuários"           description="Alerta ao registrar novo usuário" />
        <Toggle checked={notifJob}    onChange={setNotifJob}    label="Falha em jobs"             description="Alerta quando um job termina com erro" />
      </Section>

      {/* Segurança */}
      <Section icon="shield-checkmark-outline" title="Segurança" description="Dispositivo e sessão atual">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-fore mb-1.5">Device ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted border border-border rounded-xl px-3 py-2.5 text-gray-700 text-muted-fore truncate font-mono">
                {deviceId}
              </code>
              <button
                onClick={copyDeviceId}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-border text-gray-500 hover:text-primary hover:border-primary/30 transition-colors"
              >
                <IonIcon name={copied ? 'checkmark-outline' : 'copy-outline'} size={15} />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5">Identificador único deste navegador</p>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-white/5">
            <Button variant="danger" size="sm" onClick={clearSession}>
              <IonIcon name="log-out-outline" size={14} />
              Encerrar sessão e limpar dispositivo
            </Button>
          </div>
        </div>
      </Section>

      {/* Sobre */}
      <Section icon="information-circle-outline" title="Sobre" description="Informações do portal">
        <div className="space-y-2 text-sm">
          {[
            { label: 'Portal',  value: 'MEX Admin' },
            { label: 'Versão',  value: '1.0.0' },
            { label: 'Base URL', value: '/api/v1' },
            { label: 'Ambiente', value: (import.meta as unknown as { env: { MODE: string } }).env.MODE === 'production' ? 'Produção' : 'Desenvolvimento' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
              <span className="text-muted-fore">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

