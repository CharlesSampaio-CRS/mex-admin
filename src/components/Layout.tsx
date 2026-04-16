import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { IonIcon } from '@/components/ui/IonIcon'
import type { ReactNode } from 'react'

const NAV = [
  { to: '/admin',           icon: 'grid-outline',             label: 'Dashboard',     end: true },
  { to: '/admin/users',     icon: 'people-outline',           label: 'Usuários'                 },
  { to: '/admin/support',   icon: 'headset-outline',          label: 'Suporte'                  },
  { to: '/admin/exchanges', icon: 'swap-horizontal-outline',  label: 'Exchanges'                },
  { to: '/admin/jobs',      icon: 'hardware-chip-outline',    label: 'Jobs'                     },
  { to: '/admin/costs',     icon: 'cash-outline',             label: 'Custos'                   },
  { to: '/admin/settings',  icon: 'settings-outline',         label: 'Configurações'            },
]

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f0f14] text-gray-900 dark:text-white overflow-hidden">

      {/* ── Overlay mobile ── */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-white dark:bg-[#1a1a24] border-r border-gray-200 dark:border-white/8 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200 dark:border-white/8 shrink-0">
          <img src="/icons/icon.png" alt="MEX" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-base tracking-tight">
            MEX <span className="text-primary">Admin</span>
          </span>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <IonIcon name="close-outline" size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              )}
            >
              <IonIcon name={icon} size={17} />
              <span className="flex-1">{label}</span>
              <IonIcon name="chevron-forward-outline" size={13} className="opacity-30" />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-gray-200 dark:border-white/8 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold uppercase">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Sair" className="text-gray-400 hover:text-red-400 transition-colors">
              <IonIcon name="log-out-outline" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 h-16 border-b border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a24] shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setOpen(true)}>
            <IonIcon name="menu-outline" size={22} />
          </button>
          <div className="flex-1" />
          <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <IonIcon name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={17} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
