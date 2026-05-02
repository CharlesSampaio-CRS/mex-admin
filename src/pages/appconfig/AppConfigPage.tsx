import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { IonIcon } from '@/components/ui/IonIcon'
import { cn } from '@/lib/utils'
import { apiGetAppConfig, apiPatchAppConfig, type FeatureFlags } from '@/lib/api'

const DEFAULTS: FeatureFlags = {
  ai_chat_enabled:             true,
  price_alerts_enabled:        true,
  orders_enabled:              true,
  strategies_enabled:          true,
  pix_deposit_enabled:         true,
  support_attachments_enabled: true,
  registration_enabled:        true,
  maintenance_mode:             false,
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Section({ icon, title, description, accent, children }: {
  icon: string; title: string; description: string; accent?: string; children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', accent ?? 'bg-primary/10')}>
            <IonIcon name={icon} size={16} className={accent ? 'text-white' : 'text-primary'} />
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

function FlagToggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  danger,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-fore mt-0.5">{description}</p>}
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-50',
          checked
            ? danger ? 'bg-red-500' : 'bg-primary'
            : 'bg-gray-200 dark:bg-white/10',
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )} />
      </button>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function AppConfigPage() {
  const [flags, setFlags]     = useState<FeatureFlags>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState<string | null>(null)

  // ── Carrega flags do backend ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    apiGetAppConfig()
      .then(data => setFlags({ ...DEFAULTS, ...data.flags }))
      .catch(e => setError(e.message ?? 'Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [])

  // ── Salva um flag específico ──────────────────────────────────────────────
  const toggle = useCallback(async (key: keyof FeatureFlags, value: boolean) => {
    setSaving(key)
    setError(null)
    // Optimistic update
    setFlags(prev => ({ ...prev, [key]: value }))
    try {
      const data = await apiPatchAppConfig({ [key]: value })
      setFlags({ ...DEFAULTS, ...data.flags })
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } catch (e: any) {
      // Reverte em caso de erro
      setFlags(prev => ({ ...prev, [key]: !value }))
      setError(e.message ?? 'Erro ao salvar')
    } finally {
      setSaving(null)
    }
  }, [])

  const fmt = (ts?: number) =>
    ts ? new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-fore text-sm">
        <IonIcon name="reload-outline" size={18} className="mr-2 animate-spin" />
        Carregando configurações…
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-y-auto flex-1 min-h-0">

      {/* Header informativo */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/15">
        <IonIcon name="information-circle-outline" size={18} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Feature Flags do App</p>
          <p className="text-xs text-muted-fore mt-0.5">
            Ativa ou desativa funcionalidades em tempo real, sem necessidade de novo build ou deploy.
            As mudanças têm efeito imediato no próximo request do app.
          </p>
          {flags.updated_at && (
            <p className="text-xs text-muted-fore mt-1.5">
              Última atualização: <span className="font-medium text-foreground">{fmt(flags.updated_at)}</span>
              {flags.updated_by && <> por <span className="font-medium text-foreground">{flags.updated_by}</span></>}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <IonIcon name="alert-circle-outline" size={16} />
          {error}
        </div>
      )}

      {/* ── Funcionalidades principais ──────────────────────────────────── */}
      <Section icon="apps-outline" title="Funcionalidades" description="Controle quais módulos estão ativos no app">
        <FlagToggle
          checked={flags.ai_chat_enabled}
          onChange={v => toggle('ai_chat_enabled', v)}
          disabled={saving === 'ai_chat_enabled'}
          label={`Chat com IA ${saved === 'ai_chat_enabled' ? '✓' : ''}`}
          description="Assistente de IA disponível na tela de chat"
        />
        <FlagToggle
          checked={flags.price_alerts_enabled}
          onChange={v => toggle('price_alerts_enabled', v)}
          disabled={saving === 'price_alerts_enabled'}
          label={`Alertas de preço ${saved === 'price_alerts_enabled' ? '✓' : ''}`}
          description="Criação e disparo de alertas de preço para tokens"
        />
        <FlagToggle
          checked={flags.orders_enabled}
          onChange={v => toggle('orders_enabled', v)}
          disabled={saving === 'orders_enabled'}
          label={`Ordens ${saved === 'orders_enabled' ? '✓' : ''}`}
          description="Módulo de ordens de compra/venda"
        />
        <FlagToggle
          checked={flags.strategies_enabled}
          onChange={v => toggle('strategies_enabled', v)}
          disabled={saving === 'strategies_enabled'}
          label={`Estratégias ${saved === 'strategies_enabled' ? '✓' : ''}`}
          description="Criação e gerenciamento de estratégias automatizadas"
        />
        <FlagToggle
          checked={flags.pix_deposit_enabled}
          onChange={v => toggle('pix_deposit_enabled', v)}
          disabled={saving === 'pix_deposit_enabled'}
          label={`Banner PIX Deposit ${saved === 'pix_deposit_enabled' ? '✓' : ''}`}
          description="Exibe o banner de depósito via PIX na tela inicial"
        />
        <FlagToggle
          checked={flags.support_attachments_enabled}
          onChange={v => toggle('support_attachments_enabled', v)}
          disabled={saving === 'support_attachments_enabled'}
          label={`Anexos no suporte ${saved === 'support_attachments_enabled' ? '✓' : ''}`}
          description="Permite enviar prints nos chamados de suporte (máx 2 × 2MB)"
        />
      </Section>

      {/* ── Cadastro ─────────────────────────────────────────────────────── */}
      <Section icon="person-add-outline" title="Cadastro" description="Controle de novos registros no app">
        <FlagToggle
          checked={flags.registration_enabled}
          onChange={v => toggle('registration_enabled', v)}
          disabled={saving === 'registration_enabled'}
          label={`Novos cadastros ${saved === 'registration_enabled' ? '✓' : ''}`}
          description="Permite que novos usuários criem conta. Desative para fechar o acesso."
        />
      </Section>

      {/* ── Manutenção ───────────────────────────────────────────────────── */}
      <Section
        icon="construct-outline"
        title="Manutenção"
        description="Coloca o app em modo manutenção"
        accent={flags.maintenance_mode ? 'bg-red-500' : undefined}
      >
        <FlagToggle
          checked={flags.maintenance_mode}
          onChange={v => toggle('maintenance_mode', v)}
          disabled={saving === 'maintenance_mode'}
          label={`Modo manutenção ${saved === 'maintenance_mode' ? '✓' : ''}`}
          description="Exibe tela de manutenção para todos os usuários ao abrir o app. Use com cuidado."
          danger
        />
        {flags.maintenance_mode && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-500 font-medium">
            <IonIcon name="warning-outline" size={14} />
            Modo manutenção ATIVO — o app está indisponível para os usuários
          </div>
        )}
      </Section>

    </div>
  )
}
