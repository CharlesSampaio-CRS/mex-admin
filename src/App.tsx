import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { SupportPage } from '@/pages/support/SupportPage'
import { ExchangesPage } from '@/pages/exchanges/ExchangesPage'
import { JobsPage } from '@/pages/jobs/JobsPage'
import { CostsPage } from '@/pages/costs/CostsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { WebViewsPage } from '@/pages/webviews/WebViewsPage'
import { SecurityPage } from '@/pages/security/SecurityPage'
import { EmailPage } from '@/pages/email/EmailPage'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/login" replace />
  // NotificationsProvider only mounts after auth is confirmed — no pre-auth API calls
  return <NotificationsProvider>{children}</NotificationsProvider>
}

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAdmin>
              <Layout>
                <Routes>
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="exchanges" element={<ExchangesPage />} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="costs" element={<CostsPage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="email" element={<EmailPage />} />
                  <Route path="webviews" element={<WebViewsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
