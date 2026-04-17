import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { apiLogin } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'

export function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [email,     setEmail]     = useState(() => localStorage.getItem('mex_admin_saved_email') ?? '')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [saveEmail, setSaveEmail] = useState(() => !!localStorage.getItem('mex_admin_saved_email'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(email.trim(), password)
      if (saveEmail) localStorage.setItem('mex_admin_saved_email', email.trim())
      else           localStorage.removeItem('mex_admin_saved_email')
      login(data.token, { email: email.trim(), name: email.trim(), roles: data.user.roles })
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/admin/icons/icon.png" alt="MEX" className="w-10 h-10 rounded-xl object-cover" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            MEX <span className="text-primary">Admin</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-accent to-primary" />
          <div className="p-8">
            <p className="text-xs font-bold tracking-widest text-accent uppercase mb-1">Portal de gestão</p>
            <h1 className="text-xl font-bold text-foreground mb-1">Entrar</h1>
            <p className="text-sm text-muted-fore mb-6">Use sua conta MEX com role admin</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-fore mb-1.5">E-mail</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  placeholder="admin@mex.app.br"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-muted border border-border text-foreground placeholder-muted-fore outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={saveEmail}
                    onChange={e => setSaveEmail(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-fore select-none">Lembrar e-mail</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-fore mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm bg-muted border border-border text-foreground placeholder-muted-fore outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fore hover:text-foreground">
                    {showPw ? <IonIcon name="eye-off-outline" size={16} /> : <IonIcon name="eye-outline" size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Entrar no portal
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-muted-fore mt-6">
          MEX Admin Portal · acesso restrito
        </p>
      </div>
    </div>
  )
}