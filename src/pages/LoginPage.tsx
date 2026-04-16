import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { apiLogin } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { IonIcon } from '@/components/ui/IonIcon'

export function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(email.trim(), password)
      login(data.token, { email: email.trim(), name: email.trim(), roles: data.user.roles })
      navigate('/admin')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#0f0f14]">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">M</div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            MEX <span className="text-primary">Admin</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-white/8 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-primary to-primary/30" />
          <div className="p-8">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Portal de gestão</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Entrar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Use sua conta MEX com role admin</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">E-mail</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  placeholder="admin@mex.app.br"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showPw ? <IonIcon name="eye-off-outline" size={16} /> : <IonIcon name="eye-outline" size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Entrar no portal
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          MEX Admin Portal · acesso restrito
        </p>
      </div>
    </div>
  )
}
