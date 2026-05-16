import { IonIcon } from '@/components/ui/IonIcon'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white text-neutral-900">
      <div className="max-w-xl w-full px-6 py-12 rounded-2xl shadow-lg border border-neutral-100 bg-white/80 backdrop-blur">
        <div className="flex flex-col items-center gap-4 mb-8">
          <IonIcon name="rocket-outline" size={48} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Mex Admin</h1>
          <p className="text-lg text-neutral-500 text-center">
            Plataforma de administração profissional, leve e moderna.<br />
            Gerencie usuários, exchanges, custos e mais com facilidade.
          </p>
        </div>
        <div className="flex flex-row gap-6 justify-center mb-8">
          <div className="flex flex-col items-center">
            <IonIcon name="people-outline" size={32} className="text-blue-500 mb-2" />
            <span className="text-sm font-medium">Usuários</span>
          </div>
          <div className="flex flex-col items-center">
            <IonIcon name="shield-checkmark-outline" size={32} className="text-green-500 mb-2" />
            <span className="text-sm font-medium">Segurança</span>
          </div>
          <div className="flex flex-col items-center">
            <IonIcon name="bar-chart-outline" size={32} className="text-purple-500 mb-2" />
            <span className="text-sm font-medium">Relatórios</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition">
            <IonIcon name="log-in-outline" size={20} />
            Entrar
          </a>
        </div>
      </div>
      <footer className="mt-12 text-neutral-400 text-xs">Mex Admin &copy; {new Date().getFullYear()}</footer>
    </div>
  )
}
