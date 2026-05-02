import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import { cn } from '@/lib/utils'
import { IonIcon } from '@/components/ui/IonIcon'
import { NotificationsPanel } from '@/components/NotificationsPanel'
import type { ReactNode } from 'react'

const NAV = [
  { to: '/',           icon: 'grid-outline',            label: 'Dashboard',    end: true },
  { to: '/users',      icon: 'people-outline',          label: 'Usuários'               },
  { to: '/support',    icon: 'headset-outline',         label: 'Suporte'                },
  { to: '/exchanges',  icon: 'swap-horizontal-outline', label: 'Exchanges'              },
  { to: '/jobs',       icon: 'hardware-chip-outline',   label: 'Jobs'                   },
  { to: '/costs',      icon: 'cash-outline',            label: 'Custos'                 },
  { to: '/security',   icon: 'shield-checkmark-outline', label: 'Segurança'             },
  { to: '/email',      icon: 'mail-outline',             label: 'Email'                 },
  { to: '/settings',    icon: 'settings-outline',        label: 'Configurações'          },
  { to: '/app-config',  icon: 'toggle-outline',           label: 'Feature Flags'          },
]

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout }   = useAuth()
  const { theme, toggle }  = useTheme()
  const { unreadCount }    = useNotifications()
  const navigate           = useNavigate()
  const [open,      setOpen]      = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar transition-all duration-200 lg:translate-x-0 lg:static lg:z-auto shrink-0',
        open ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'w-[60px]' : 'w-52'
      )}>

        {/* Logo */}
        <div className="flex items-center h-12 shrink-0 px-3 gap-2">
          {collapsed ? (
            <button
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-muted transition-colors mx-auto"
              title="Expandir menu"
              onClick={() => setCollapsed(false)}
            >
              <img src="/admin/icons/icon.png" alt="MEX" className="w-7 h-7 rounded-md object-cover" />
            </button>
          ) : (
            <>
              <img src="/admin/icons/icon.png" alt="MEX" className="w-7 h-7 rounded-md object-cover shrink-0" />
              <span className="font-semibold text-sm whitespace-nowrap flex-1">
                MEX <span className="text-primary">Admin</span>
              </span>
              <button
                className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md text-muted-fore hover:text-foreground hover:bg-muted transition-colors shrink-0"
                title="Recolher menu"
                onClick={() => setCollapsed(true)}
              >
                <IonIcon name="chevron-back-outline" size={13} />
              </button>
            </>
          )}
          <button className="lg:hidden ml-auto text-muted-fore hover:text-foreground" onClick={() => setOpen(false)}>
            <IonIcon name="close-outline" size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={() => setOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-fore hover:text-foreground hover:bg-muted'
              )}
            >
              <span className="relative shrink-0">
                <IonIcon name={icon} size={15} />
                {/* Badge de não-lidos — apenas no item Suporte */}
                {to === '/support' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5
                                   bg-red-500 text-white text-[9px] font-bold rounded-full
                                   flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && <span className="flex-1 whitespace-nowrap">{label}</span>}
              {/* Contador textual no modo expandido */}
              {!collapsed && to === '/support' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold
                                 px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Ferramentas */}
          <NavLink
            to="/webviews"
            onClick={() => setOpen(false)}
            title={collapsed ? 'Ferramentas' : undefined}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
              collapsed && 'justify-center',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-fore hover:text-foreground hover:bg-muted'
            )}
          >
            <IonIcon name="construct-outline" size={15} className="shrink-0" />
            {!collapsed && <span className="flex-1 whitespace-nowrap">Ferramentas</span>}
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="shrink-0 p-2 border-t border-border">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold uppercase"
                title={user?.name || 'Admin'}
              >
                {user?.name?.charAt(0) ?? 'A'}
              </div>
              <button onClick={handleLogout} title="Sair" className="text-muted-fore hover:text-destructive transition-colors">
                <IonIcon name="log-out-outline" size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold uppercase shrink-0">
                {user?.name?.charAt(0) ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-muted-fore truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} title="Sair" className="text-muted-fore hover:text-destructive transition-colors shrink-0">
                <IonIcon name="log-out-outline" size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 lg:px-6 h-12 bg-header border-b border-border shrink-0">
          <button className="lg:hidden text-muted-fore hover:text-foreground" onClick={() => setOpen(true)}>
            <IonIcon name="menu-outline" size={20} />
          </button>
          <div className="flex-1" />
          <NotificationsPanel />
          <button
            onClick={toggle}
            className="group w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <IonIcon
              name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={16}
              className="text-muted-fore group-hover:text-foreground transition-colors"
            />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0">
          {children}
        </main>
      </div>
    </div>
  )
}
