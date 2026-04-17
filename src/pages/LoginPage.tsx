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
      navigate('/admin')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-[#0b1120]">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/admin/icons/icon.png" alt="MEX" className="w-10 h-10 rounded-xl object-cover" />
          <span className="text-xl font-bold tracking-tight text-white">
            MEX <span className="text-[#1a6ff7]">Admin</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#0f1e35] rounded-2xl border border-white/8 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-[#f5c518] to-[#1a6ff7]" />
          <div className="p-8">
            <p className="text-xs font-bold tracking-widest text-[#f5c518] uppercase mb-1">Portal de gestão</p>
            <h1 className="text-xl font-bold text-white mb-1">Entrar</h1>
            <p className="text-sm text-gray-400 mb-6">Use sua conta MEX com role admin</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">E-mail</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  placeholder="admin@mex.app.br"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-[#1a6ff7] focus:ring-1 focus:ring-[#1a6ff7]/30 transition-colors"
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={saveEmail}
                    onChange={e => setSaveEmail(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#1a6ff7] cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 select-none">Lembrar e-mail</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-[#1a6ff7] focus:ring-1 focus:ring-[#1a6ff7]/30 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
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

        <p className="text-center text-xs text-gray-600 mt-6">
          MEX Admin Portal · acesso restrito
        </p>
      </div>
    </div>
  )
}