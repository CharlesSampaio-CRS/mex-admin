import { useState, useEffect, useRef } from 'react'
import {
  apiListUsers,
  apiAdminSendEmail,
  type SendAdminEmailPayload,
} from '@/lib/api'
import type { AdminUser } from '@/types'
import { IonIcon } from '@/components/ui/IonIcon'

// ─── Assuntos predefinidos ────────────────────────────────────────────────────
const SUBJECT_PRESETS = [
  { label: 'Selecione um assunto…',      value: '' },
  { label: '📢 Informações importantes', value: 'Informações importantes sobre o MEX' },
  { label: '🚀 Novidades do MEX',        value: 'Novidades do MEX — confira o que há de novo!' },
  { label: '🔔 Atualização do app',      value: 'Nova versão do MEX disponível' },
  { label: '⭐ Oferta especial',         value: 'Oferta especial para você — MEX Pro' },
  { label: '🛡️ Aviso de segurança',     value: 'Aviso de segurança — ação necessária' },
  { label: '💡 Dica de uso',             value: 'Dica: sabia que você pode fazer isso no MEX?' },
  { label: '📊 Relatório mensal',        value: 'Seu resumo mensal no MEX' },
  { label: '✉️ Personalizado…',         value: '__custom__' },
]

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim()
}

const LOGO_URL = '/admin/icons/icon.png'
function wrapInEmailTemplate(subject: string, html: string) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<style>
body{margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0}
.wrap{max-width:580px;margin:0 auto;padding:32px 16px}
.card{background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155}
.header{background:linear-gradient(135deg,#1e3a5f 0%,#0f2952 100%);padding:32px 24px;text-align:center}
.logo{width:72px;height:72px;border-radius:16px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto}
.title{color:#fff;font-size:22px;font-weight:700;margin:0}
.body{padding:28px 24px;color:#cbd5e1;font-size:15px;line-height:1.7}
.footer{padding:16px 24px;text-align:center;color:#475569;font-size:12px;border-top:1px solid #334155}
</style></head><body>
<div class="wrap"><div class="card">
<div class="header"><img src="${LOGO_URL}" class="logo" alt="MEX"/><p class="title">${subject || '(sem assunto)'}</p></div>
<div class="body">${html || '<p>…</p>'}</div>
<div class="footer">MEX · <a href="https://mex.app.br" style="color:#3b82f6">mex.app.br</a></div>
</div></div></body></html>`
}

export function EmailPage() {
  const [allUsers, setAllUsers]           = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers]   = useState(true)
  const [search, setSearch]               = useState('')
  const [targetId, setTargetId]           = useState<string>('')
  const [subjectPreset, setSubjectPreset] = useState('')
  const [subject, setSubject]             = useState('')
  const [html, setHtml]                   = useState('<p>Olá <strong>{{nome}}</strong>,</p>\n<p></p>')
  const [preview, setPreview]             = useState(false)
  const [sending, setSending]             = useState(false)
  const [result, setResult]               = useState<{ sent: number; total: number; errors: string[] } | null>(null)
  const [error, setError]                 = useState('')
  const [confirm, setConfirm]             = useState(false)
  const iframeRef                         = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    apiListUsers(1, '', '')
      .then(r => setAllUsers(r.users))
      .catch(() => {})
      .finally(() => setLoadingUsers(false))
  }, [])

  useEffect(() => {
    if (!preview || !iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (doc) { doc.open(); doc.write(wrapInEmailTemplate(subject, html)); doc.close() }
  }, [preview, html, subject])

  const filteredUsers = search.trim()
    ? allUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers

  const targetUser     = allUsers.find(u => u.user_id === targetId)
  const recipientLabel = targetId
    ? `${targetUser?.name ?? 'Usuário'} <${targetUser?.email ?? targetId}>`
    : `Todos os usuários (${allUsers.length})`

  function handlePresetChange(val: string) {
    setSubjectPreset(val)
    if (val && val !== '__custom__') setSubject(val)
    if (val === '__custom__') setSubject('')
  }

  async function handleSend() {
    setConfirm(false); setError(''); setResult(null); setSending(true)
    const payload: SendAdminEmailPayload = {
      subject: subject.trim(),
      html: targetUser ? html.replace(/\{\{nome\}\}/g, targetUser.name ?? 'Usuário') : html,
      text: htmlToText(html),
      ...(targetId ? { user_id: targetId } : {}),
    }
    try {
      const r = await apiAdminSendEmail(payload)
      setResult({ sent: r.sent, total: r.total, errors: r.errors })
    } catch (e: any) {
      setError(e.message ?? 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <IonIcon name="mail-outline" size={22} />
          Enviar Email
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Compose e envie emails para usuários específicos ou para toda a base.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">

          {/* Destinatário */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Destinatário</label>
            <div className="relative mb-2">
              <IonIcon name="search-outline" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email…"
                className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <IonIcon name="close-outline" size={15} />
                </button>
              )}
            </div>
            {loadingUsers ? (
              <div className="text-slate-500 text-sm flex items-center gap-2">
                <IonIcon name="hourglass-outline" size={14} /> Carregando usuários…
              </div>
            ) : (
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                size={5}
                className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">📣 Broadcast — todos ({allUsers.length})</option>
                {filteredUsers.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name} — {u.email}</option>
                ))}
              </select>
            )}
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <IonIcon name="arrow-forward-outline" size={11} />
              {recipientLabel}
            </p>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assunto</label>
            <select
              value={subjectPreset}
              onChange={e => handlePresetChange(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUBJECT_PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Ou escreva um assunto personalizado…"
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Corpo HTML */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Corpo (HTML)</label>
            <p className="text-xs text-slate-500 mb-1">
              Use <code className="bg-slate-700 px-1 rounded">{'{{nome}}'}</code> para personalizar com o nome.
            </p>
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              rows={10}
              spellCheck={false}
              className="w-full bg-slate-900 text-slate-200 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setPreview(p => !p)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <IonIcon name={preview ? 'eye-off-outline' : 'eye-outline'} size={15} />
              {preview ? 'Fechar preview' : 'Preview'}
            </button>
            <button
              disabled={!subject.trim() || !html.trim() || sending}
              onClick={() => setConfirm(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <IonIcon name={sending ? 'hourglass-outline' : 'send-outline'} size={15} />
              {sending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <IonIcon name="close-circle-outline" size={16} /> {error}
            </div>
          )}
          {result && (
            <div className={`rounded-lg px-3 py-2 text-sm flex items-start gap-2 ${result.errors.length === 0 ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-yellow-900/40 border border-yellow-700 text-yellow-300'}`}>
              <IonIcon name={result.errors.length === 0 ? 'checkmark-circle-outline' : 'warning-outline'} size={16} className="mt-0.5 shrink-0" />
              <div>
                Enviados: <strong>{result.sent}/{result.total}</strong>
                {result.errors.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-xs opacity-80">
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    {result.errors.length > 5 && <li>…e mais {result.errors.length - 5} erros</li>}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className={`transition-opacity ${preview ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full min-h-[500px] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-slate-400 ml-2">Preview do email</span>
            </div>
            <iframe ref={iframeRef} title="Email preview" className="flex-1 w-full bg-white" sandbox="allow-same-origin" />
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <IonIcon name="mail-outline" size={18} /> Confirmar envio
            </h2>
            <p className="text-sm text-slate-300">
              Enviar <strong className="text-white">"{subject}"</strong> para{' '}
              <strong className="text-blue-400">{recipientLabel}</strong>.
            </p>
            <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <IonIcon name="close-outline" size={15} /> Cancelar
              </button>
              <button onClick={handleSend} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <IonIcon name="send-outline" size={15} /> Enviar agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
