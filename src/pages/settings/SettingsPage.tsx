import { Card, CardBody } from '@/components/ui/Card'
import { IonIcon } from '@/components/ui/IonIcon'

export function SettingsPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configurações do painel administrativo</p>
      </div>
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-16 gap-4">
          <IonIcon name="settings-outline" size={48} className="text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Em breve</p>
        </CardBody>
      </Card>
    </div>
  )
}
