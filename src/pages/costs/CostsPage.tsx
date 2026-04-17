import { Card, CardBody } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface CostItem {
  category: string
  service: string
  description: string
  monthly: number
}

const COSTS: CostItem[] = [
  { category: 'Infraestrutura', service: 'AWS EC2', description: 't3.medium — servidor principal', monthly: 35 },
  { category: 'Infraestrutura', service: 'AWS Route 53', description: 'DNS + domínio mex.app.br', monthly: 2 },
  { category: 'Banco de Dados', service: 'MongoDB Atlas', description: 'M10 cluster (replica set)', monthly: 57 },
  { category: 'Banco de Dados', service: 'Redis (Upstash)', description: 'Cache & pub/sub', monthly: 10 },
  { category: 'Mobile / Push', service: 'Expo EAS', description: 'Build & update OTA', monthly: 29 },
  { category: 'Mobile / Push', service: 'Firebase FCM', description: 'Push notifications (gratuito)', monthly: 0 },
  { category: 'Monitoramento', service: 'Sentry', description: 'Error tracking', monthly: 0 },
  { category: 'Email', service: 'Resend', description: 'Transactional emails', monthly: 20 },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Infraestrutura': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Banco de Dados': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Mobile / Push': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Monitoramento': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Email': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
}

export function CostsPage() {
  const total = COSTS.reduce((s, c) => s + c.monthly, 0)

  const categories = [...new Set(COSTS.map(c => c.category))]

  return (
    <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
      <p className="text-sm text-muted-fore">Custos mensais estimados de operação</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(cat => {
          const subtotal = COSTS.filter(c => c.category === cat).reduce((s, c) => s + c.monthly, 0)
          return (
            <Card key={cat}>
              <CardBody className="text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[cat] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {cat}
                </span>
                <p className="text-lg font-bold text-foreground mt-2">{formatCurrency(subtotal)}</p>
                <p className="text-xs text-gray-500">/mês</p>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Detail table */}
      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-fore uppercase tracking-wide">Serviço</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-fore uppercase tracking-wide hidden sm:table-cell">Descrição</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-fore uppercase tracking-wide">Mensal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COSTS.map((item, i) => (
                <tr key={i} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{item.service}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[item.category] ?? ''}`}>{item.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-fore hidden sm:table-cell">{item.description}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                    {item.monthly === 0 ? <span className="text-success text-xs font-semibold">Gratuito</span> : formatCurrency(item.monthly)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted">
                <td className="px-4 py-3 font-bold text-foreground" colSpan={2}>Total mensal</td>
                <td className="px-4 py-3 text-right font-bold font-mono text-primary text-base">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
