import { useState, useEffect, useRef } from 'react'
import {
  apiListUsers,
  apiAdminSendEmail,
  type SendAdminEmailPayload,
} from '@/lib/api'
import type { AdminUser, Plan } from '@/types'
import { IonIcon } from '@/components/ui/IonIcon'

// ─── Templates predefinidos ───────────────────────────────────────────────────

const PRESETS = [
  {
    id: 'announce', icon: 'megaphone-outline', color: '#f97316', bg: '#fff7ed',
    label: 'Anúncio',
    subject: 'Informações importantes sobre o MEX',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p>Temos uma informação importante para compartilhar com você.</p>\n<p>[Escreva aqui o conteúdo da mensagem]</p>\n<p>Qualquer dúvida, entre em contato pelo suporte dentro do app.</p>\n<p>Atenciosamente,<br/><strong>Equipe MEX</strong></p>`,
  },
  {
    id: 'news', icon: 'rocket-outline', color: '#7c6af7', bg: '#f5f3ff',
    label: 'Novidades',
    subject: 'Novidades do MEX — confira o que há de novo!',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p>Temos novidades incríveis para você! Confira o que acabamos de lançar:</p>\n<ul>\n  <li>✅ [Nova funcionalidade 1]</li>\n  <li>✅ [Nova funcionalidade 2]</li>\n  <li>✅ [Melhoria 3]</li>\n</ul>\n<p>Abra o MEX agora e explore tudo isso!</p>\n<p>Até mais,<br/><strong>Equipe MEX</strong></p>`,
  },
  {
    id: 'update', icon: 'phone-portrait-outline', color: '#3b82f6', bg: '#eff6ff',
    label: 'Atualização',
    subject: 'Nova versão do MEX disponível',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p>Uma nova versão do MEX já está disponível na loja! Atualize agora:</p>\n<ul>\n  <li>🔧 Correções de estabilidade</li>\n  <li>⚡ Melhor desempenho</li>\n  <li>✨ [Novidade da versão]</li>\n</ul>\n<p>Acesse a <strong>App Store</strong> ou <strong>Google Play</strong> e atualize.</p>\n<p>Abraços,<br/><strong>Equipe MEX</strong></p>`,
  },
  {
    id: 'offer', icon: 'star-outline', color: '#f59e0b', bg: '#fffbeb',
    label: 'Oferta',
    subject: 'Oferta especial para você — MEX Pro',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p>Preparamos uma oferta exclusiva especialmente para você!</p>\n<p><strong>🎁 [Descrição da oferta]</strong></p>\n<p>Essa condição é por tempo limitado. Não perca!</p>\n<p>Abraços,<br/><strong>Equipe MEX</strong></p>`,
  },
  {
    id: 'security', icon: 'shield-checkmark-outline', color: '#ef4444', bg: '#fef2f2',
    label: 'Segurança',
    subject: 'Aviso de segurança — ação necessária',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p>Identificamos uma situação que requer a sua atenção em relação à segurança da sua conta.</p>\n<p><strong>[Descreva o aviso de segurança aqui]</strong></p>\n<p>Recomendamos que você:</p>\n<ul>\n  <li>🔒 Verifique os acessos recentes</li>\n  <li>🔑 Atualize sua senha se necessário</li>\n  <li>📱 Confirme que apenas seus dispositivos têm acesso</li>\n</ul>\n<p>Atenciosamente,<br/><strong>Equipe de Segurança MEX</strong></p>`,
  },
  {
    id: 'tip', icon: 'bulb-outline', color: '#14b8a6', bg: '#f0fdfa',
    label: 'Dica',
    subject: 'Dica: sabia que você pode fazer isso no MEX?',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p>Sabia que o MEX tem uma funcionalidade que pode facilitar muito sua vida?</p>\n<p><strong>💡 [Nome da dica]</strong></p>\n<p>[Explique como usar em 2–3 frases simples]</p>\n<p>Abra o MEX e experimente agora mesmo!</p>\n<p>Abraços,<br/><strong>Equipe MEX</strong></p>`,
  },
  {
    id: 'report', icon: 'bar-chart-outline', color: '#22c55e', bg: '#f0fdf4',
    label: 'Relatório',
    subject: 'Seu resumo mensal no MEX',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p>Confira o resumo da sua atividade no MEX este mês:</p>\n<ul>\n  <li>📊 Exchanges conectadas: [N]</li>\n  <li>💰 Saldo total monitorado: [valor]</li>\n  <li>🔔 Alertas disparados: [N]</li>\n</ul>\n<p>Continue acompanhando seus ativos com o MEX!</p>\n<p>Abraços,<br/><strong>Equipe MEX</strong></p>`,
  },
  {
    id: 'custom', icon: 'create-outline', color: '#94a3b8', bg: '#f8fafc',
    label: 'Livre',
    subject: '',
    body: `<p>Olá <strong>{{nome}}</strong>,</p>\n<p></p>`,
  },
] as const

// ─── Badges de plano ──────────────────────────────────────────────────────────

const PLAN_BADGE: Record<Plan, { label: string; cls: string }> = {
  premium: { label: 'PREMIUM', cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  pro:     { label: 'PRO',     cls: 'bg-violet-500/20 text-violet-400 border border-violet-500/30' },
  free:    { label: 'FREE',    cls: 'bg-slate-700/60 text-slate-500 border border-slate-700/60' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim()
}

// ─── Preview HTML — replica fiel do template Rust ────────────────────────────

const LOGO_URL = '/admin/icons/icon.png'
const ACCENT   = '#7c6af7'

function buildPreview(subject: string, body: string, recipientName = 'João Silva'): string {
  const content = body.replace(
    /\{\{nome\}\}/g,
    `<strong style="color:#12112a">${recipientName}</strong>`,
  )
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject || '(sem assunto)'}</title>
  <style>
    body { margin:0; padding:0; background:#eceaf8; }
    .eb p            { margin:0 0 16px 0; font-size:15px; line-height:1.78; color:#48466a; }
    .eb p:last-child { margin-bottom:0; }
    .eb strong       { color:#12112a; font-weight:600; }
    .eb a            { color:${ACCENT}; text-decoration:none; font-weight:500; }
    .eb ul, .eb ol   { margin:0 0 16px 0; padding-left:22px; }
    .eb li           { margin-bottom:8px; font-size:15px; line-height:1.65; color:#48466a; }
    .eb h2           { margin:0 0 14px 0; font-size:18px; font-weight:700; color:#12112a; }
    .eb .callout     { background:#f5f3ff; border-left:3px solid ${ACCENT}; border-radius:0 10px 10px 0; padding:14px 16px; margin:0 0 16px 0; }
    .eb .callout p   { color:#524fa0; font-size:14px; margin-bottom:0; }
    .eb .btn         { display:inline-block; background:${ACCENT}; color:#fff !important; text-decoration:none !important; padding:13px 30px; border-radius:10px; font-weight:700; font-size:15px; }
  </style>
</head>
<body style="margin:0;padding:0;background:#eceaf8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eceaf8;">
  <tr><td align="center" style="padding:44px 16px 60px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;">
      <tr><td align="center" style="padding-bottom:22px;">
        <img src="${LOGO_URL}" width="72" height="72" alt="MEX"
          style="display:block;border-radius:20px;margin:0 auto;border:0;
                 box-shadow:0 0 0 6px rgba(255,255,255,0.7),0 8px 28px rgba(124,106,247,0.22);">
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:20px;border:1px solid #e0ddf7;overflow:hidden;
                     box-shadow:0 6px 40px rgba(100,80,220,0.12);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="height:5px;background:linear-gradient(90deg,${ACCENT} 0%,#a890ff 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:32px 40px 22px;border-bottom:1px solid #f0eefb;">
            <p style="margin:0 0 7px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${ACCENT};">Mensagem do MEX</p>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#12112a;line-height:1.28;font-family:-apple-system,sans-serif;">${subject || '(sem assunto)'}</h1>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="eb" style="padding:28px 40px 36px;font-size:15px;line-height:1.78;color:#48466a;font-family:-apple-system,sans-serif;">
            ${content}
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:20px 40px 28px;border-top:1px solid #f0eefb;background:#fdfcff;border-radius:0 0 20px 20px;">
            <p style="margin:0 0 5px;font-size:13px;color:#9090b8;text-align:center;line-height:1.6;">
              <a href="https://mex.app.br" style="color:${ACCENT};text-decoration:none;font-weight:500;">mex.app.br</a>
              &nbsp;·&nbsp; E-mail automático — não responda.
            </p>
            <p style="margin:0;font-size:11px;color:#b8b8d0;text-align:center;">© 2026 Mex App. Todos os direitos reservados.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

// ─── Componente principal ─────────────────────────────────────────────────────

const DEFAULT_BODY = `<p>Olá <strong>{{nome}}</strong>,</p>\n<p></p>`

export function EmailPage() {
  const [allUsers, setAllUsers]         = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [search, setSearch]             = useState('')
  const [targetId, setTargetId]         = useState('')
  const [activePreset, setActivePreset] = useState('')
  const [subject, setSubject]           = useState('')
  const [html, setHtml]                 = useState(DEFAULT_BODY)
  const [sending, setSending]           = useState(false)
  const [result, setResult]             = useState<{ sent: number; total: number; errors: string[] } | null>(null)
  const [error, setError]               = useState('')
  const [confirm, setConfirm]           = useState(false)
  const iframeRef                       = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    apiListUsers(1, '', '')
      .then(r => setAllUsers(r.users))
      .catch(() => {})
      .finally(() => setLoadingUsers(false))
  }, [])

  // Preview ao vivo — atualiza a cada render
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    doc.open()
    doc.write(buildPreview(subject, html, targetUser?.name ?? 'João Silva'))
    doc.close()
  })

  const filteredUsers = search.trim()
    ? allUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : allUsers

  const targetUser  = allUsers.find(u => u.user_id === targetId)
  const isBroadcast = !targetId

  function selectPreset(id: string) {
    const p = PRESETS.find(x => x.id === id)
    if (!p) return
    setActivePreset(id)
    setSubject(p.id === 'custom' ? '' : p.subject)
    setHtml(p.body)
  }

  async function handleSend() {
    setConfirm(false); setError(''); setResult(null); setSending(true)
    const finalHtml = targetUser
      ? html.replace(/\{\{nome\}\}/g, targetUser.name ?? 'Usuário')
      : html
    const payload: SendAdminEmailPayload = {
      subject: subject.trim(),
      html:    finalHtml,   // backend envolve com email_header/email_footer
      text:    htmlToText(finalHtml),
      ...(targetId ? { user_id: targetId } : {}),
    }
    try {
      const r = await apiAdminSendEmail(payload)
      setResult({ sent: r.sent, total: r.total, errors: r.errors })
      if (r.sent > 0) {
        setTargetId(''); setSearch(''); setActivePreset('')
        setSubject(''); setHtml(DEFAULT_BODY)
      }
    } catch (e: any) {
      setError(e.message ?? 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  const canSend = subject.trim().length > 0 && html.trim().length > 0 && !sending

  return (
    <div className="flex flex-col h-full p-5 gap-4 max-w-[1400px] mx-auto">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25
                          flex items-center justify-center">
            <IonIcon name="mail-outline" size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Enviar Email</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Compose e envie mensagens para usuários
            </p>
          </div>
        </div>

        {/* Pill de destinatário */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5
                         rounded-full border transition-colors ${
          isBroadcast
            ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
        }`}>
          <IonIcon name={isBroadcast ? 'radio-outline' : 'person-circle-outline'} size={13} />
          {isBroadcast
            ? `Broadcast — ${allUsers.length} usuários`
            : (targetUser?.name ?? targetUser?.email ?? '…')}
        </div>
      </div>

      {/* ── Layout principal ───────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ══ Coluna esquerda: Compose ══════════════════════════════════════ */}
        <div className="w-[400px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto pb-1 pr-0.5">

          {/* — Destinatário ——————————————————————————————————————————————— */}
          <section className="bg-slate-800/50 rounded-2xl border border-slate-700/60 p-4">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest
                           mb-3 flex items-center gap-1.5">
              <IonIcon name="people-outline" size={12} className="text-slate-500" />
              Destinatário
            </h2>

            <div className="relative mb-2.5">
              <IonIcon name="search-outline" size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email…"
                className="w-full bg-slate-900/70 text-white border border-slate-700/70 rounded-xl
                           pl-8 pr-8 py-2 text-sm placeholder-slate-600
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                           focus:border-indigo-500/50 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                             text-slate-500 hover:text-slate-300 transition-colors">
                  <IonIcon name="close-circle" size={15} />
                </button>
              )}
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm py-4">
                <IonIcon name="hourglass-outline" size={14} />
                Carregando…
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700/50 overflow-hidden
                              bg-slate-900/50 max-h-52 overflow-y-auto divide-y divide-slate-800/80">

                {/* Broadcast */}
                <button
                  onClick={() => { setTargetId(''); setSearch('') }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all ${
                    !targetId
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center
                                    flex-shrink-0 text-[13px] ${
                    !targetId
                      ? 'bg-indigo-500/25 text-indigo-300'
                      : 'bg-slate-700/60 text-slate-400'
                  }`}>
                    <IonIcon name="radio-outline" size={13} />
                  </span>
                  <span className="font-semibold flex-1 text-left">Todos os usuários</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-700/70
                                   text-slate-400 font-medium tabular-nums">
                    {allUsers.length}
                  </span>
                  {!targetId && (
                    <IonIcon name="checkmark-circle" size={15} className="text-indigo-400 flex-shrink-0" />
                  )}
                </button>

                {filteredUsers.length === 0 ? (
                  <div className="px-3 py-5 text-slate-600 text-sm text-center">
                    Nenhum usuário encontrado
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const badge    = PLAN_BADGE[u.subscription_plan] ?? PLAN_BADGE.free
                    const initials = getInitials(u.name || u.email)
                    const selected = targetId === u.user_id
                    return (
                      <button
                        key={u.user_id}
                        onClick={() => { setTargetId(u.user_id); setSearch('') }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm
                                    transition-all ${
                          selected
                            ? 'bg-indigo-500/15 text-indigo-300'
                            : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center
                                         justify-center text-[11px] font-bold text-slate-300
                                         flex-shrink-0 select-none">
                          {initials}
                        </span>
                        <span className="truncate font-medium flex-1 text-left">
                          {u.name || u.email}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {selected && (
                          <IonIcon name="checkmark-circle" size={15}
                            className="text-indigo-400 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </section>

          {/* — Template ───────────────────────────────────————————————————— */}
          <section className="bg-slate-800/50 rounded-2xl border border-slate-700/60 p-4">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest
                           mb-3 flex items-center gap-1.5">
              <IonIcon name="albums-outline" size={12} className="text-slate-500" />
              Template
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  title={p.subject || p.label}
                  onClick={() => selectPreset(p.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border
                               text-center transition-all ${
                    activePreset === p.id
                      ? 'border-indigo-500/70 bg-indigo-500/10 scale-[1.04] shadow-sm shadow-indigo-500/20'
                      : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/50 hover:scale-[1.02]'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: p.bg, color: p.color }}
                  >
                    <IonIcon name={p.icon} size={16} />
                  </span>
                  <span className={`text-[10px] font-semibold leading-tight ${
                    activePreset === p.id ? 'text-indigo-300' : 'text-slate-500'
                  }`}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* — Assunto ────────────────────────────────────────────────────── */}
          <section className="bg-slate-800/50 rounded-2xl border border-slate-700/60 p-4">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest
                           mb-2.5 flex items-center gap-1.5">
              <IonIcon name="text-outline" size={12} className="text-slate-500" />
              Assunto
            </h2>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Digite o assunto do email…"
              maxLength={120}
              className="w-full bg-slate-900/70 text-white border border-slate-700/70 rounded-xl
                         px-3 py-2 text-sm placeholder-slate-600
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                         focus:border-indigo-500/50 transition-colors"
            />
            <p className="text-[11px] text-slate-600 mt-1.5 text-right tabular-nums">
              {subject.length} / 120
            </p>
          </section>

          {/* — Corpo HTML ─────────────────────────────────────────────────── */}
          <section className="bg-slate-800/50 rounded-2xl border border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest
                             flex items-center gap-1.5">
                <IonIcon name="code-slash-outline" size={12} className="text-slate-500" />
                Corpo HTML
              </h2>
              <code className="text-[10px] bg-indigo-500/15 text-indigo-400
                               border border-indigo-500/25 px-1.5 py-0.5 rounded-md font-mono">
                {'{{nome}}'}
              </code>
            </div>
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              rows={13}
              spellCheck={false}
              placeholder="<p>Conteúdo do email em HTML…</p>"
              className="w-full bg-slate-900/70 text-slate-200 border border-slate-700/70 rounded-xl
                         px-3 py-2.5 text-xs font-mono placeholder-slate-600 resize-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                         focus:border-indigo-500/50 transition-colors leading-relaxed"
            />
          </section>

          {/* — Feedback ───────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm
                            rounded-xl px-3 py-2.5 flex items-center gap-2">
              <IonIcon name="close-circle-outline" size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          {result && (
            <div className={`rounded-xl px-3 py-2.5 text-sm flex items-start gap-2 border ${
              result.errors.length === 0
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
            }`}>
              <IonIcon
                name={result.errors.length === 0 ? 'checkmark-circle-outline' : 'warning-outline'}
                size={16} className="mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="font-semibold">
                  Enviados: {result.sent} / {result.total}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-xs opacity-75 space-y-0.5">
                    {result.errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                    {result.errors.length > 3 && (
                      <li>…e mais {result.errors.length - 3} erros</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* — Botão Enviar ───────────────────────────────────────────────── */}
          <button
            disabled={!canSend}
            onClick={() => setConfirm(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]
                       disabled:opacity-35 disabled:cursor-not-allowed
                       text-white font-bold py-3 rounded-2xl transition-all
                       flex items-center justify-center gap-2 text-sm
                       shadow-lg shadow-indigo-500/20"
          >
            {sending ? (
              <><IonIcon name="hourglass-outline" size={16} /> Enviando…</>
            ) : (
              <>
                <IonIcon name="send-outline" size={16} />
                {isBroadcast
                  ? `Enviar para todos (${allUsers.length})`
                  : `Enviar para ${targetUser?.name ?? '…'}`}
              </>
            )}
          </button>
        </div>

        {/* ══ Coluna direita: Preview ao vivo ══════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60
                          overflow-hidden flex flex-col flex-1 min-h-0">

            {/* Chrome de email-client fake */}
            <div className="px-4 py-3 border-b border-slate-700/60 bg-slate-800/70 flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-[11px] text-slate-500 ml-2 font-medium tracking-wide select-none">
                  Preview — exatamente como o usuário receberá
                </span>
              </div>
              <div className="space-y-1">
                {[
                  { label: 'De',      value: 'MEX App <noreply@mex.app.br>',   hi: false },
                  { label: 'Para',    value: isBroadcast
                      ? `${allUsers.length} destinatários`
                      : (targetUser?.email ?? '—'),                            hi: false },
                  { label: 'Assunto', value: subject || '(sem assunto)',        hi: true  },
                ].map(row => (
                  <div key={row.label} className="flex items-baseline gap-2 text-xs">
                    <span className="w-14 text-right text-slate-600 font-medium flex-shrink-0">
                      {row.label}:
                    </span>
                    <span className={`truncate ${row.hi ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Iframe — preview ao vivo */}
            <iframe
              ref={iframeRef}
              title="Email preview"
              className="flex-1 w-full"
              style={{ background: '#eceaf8' }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* ── Modal de confirmação ──────────────────────────────────────────── */}
      {confirm && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center
                        justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6
                          w-full max-w-md shadow-2xl shadow-black/40">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30
                              flex items-center justify-center flex-shrink-0">
                <IonIcon name="send-outline" size={20} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Confirmar envio</h2>
                <p className="text-xs text-slate-500 mt-0.5">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-xl border border-slate-700/60
                            divide-y divide-slate-800 mb-4">
              <div className="flex gap-3 px-4 py-2.5 text-sm">
                <span className="text-slate-500 w-16 flex-shrink-0">Assunto</span>
                <span className="text-white font-medium truncate">{subject}</span>
              </div>
              <div className="flex gap-3 px-4 py-2.5 text-sm">
                <span className="text-slate-500 w-16 flex-shrink-0">Para</span>
                <span className={`font-semibold truncate ${
                  isBroadcast ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {isBroadcast
                    ? `Todos os usuários (${allUsers.length})`
                    : `${targetUser?.name} <${targetUser?.email}>`}
                </span>
              </div>
            </div>

            {isBroadcast && (
              <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl
                              px-3.5 py-3 mb-4 flex items-start gap-2.5">
                <IonIcon name="warning-outline" size={16}
                  className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Você está enviando para{' '}
                  <strong className="text-amber-300">
                    todos os {allUsers.length} usuários ativos
                  </strong>.{' '}
                  Revise bem o conteúdo antes de confirmar.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5
                           rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5
                           rounded-xl text-sm font-bold transition-all
                           flex items-center justify-center gap-2
                           shadow-md shadow-indigo-500/25"
              >
                <IonIcon name="send-outline" size={15} />
                Enviar agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

