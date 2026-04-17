import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { TOOLS } from '@/lib/tools'
import { IonIcon } from '@/components/ui/IonIcon'
import { useAuth } from '@/contexts/AuthContext'

interface ServiceCost {
  _id:              string
  service_id:       string
  label:            string
  category:         string
  is_paid:          boolean
  monthly_cost_usd: number
  updated_at:       string
}

const CATEGORY_COLORS: Record<string, string> = {
  'Infra':       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Dev':         'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Stores':      'bg-green-500/10 text-green-400 border-green-500/20',
  'Site':        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

const API = '/api/v1/admin'

export function CostsPage() {
  const { token } = useAuth()
  const [costs,   setCosts]   = useState<ServiceCost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`${API}/costs`, { headers })
    const json = await res.json()
    if (json.success) setCosts(json.data)
    setLoading(false)
  }, [token])

  const seed = useCallback(async () => {
    const entries = TOOLS.map(t => ({
      service_id:       t.id,
      label:            t.label,
      category:         t.category,
      is_paid:          (t.monthlyCostUSD ?? 0) > 0,
      monthly_cost_usd: t.monthlyCostUSD ?? 0,
    }))
    await fetch(`${API}/costs/seed`, { method: 'POST', headers, body: JSON.stringify(entries) })
  }, [token])

  useEffect(() => { seed().then(load) }, [])

  const save = async (cost: ServiceCost, is_paid: boolean, monthly_cost_usd: number) => {
    setSaving(cost._id)
    await fetch(`${API}/costs/${cost._id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ is_paid, monthly_cost_usd }),
    })
    await load()
    setSaving(null)
  }

  const handleToggle = (cost: ServiceCost, is_paid: boolean) => {
    const val = is_paid ? (parseFloat(editValues[cost._id] ?? '') || cost.monthly_cost_usd || 0) : 0
    save(cost, is_paid, val)
  }

  const handleValueBlur = (cost: ServiceCost) => {
    if (!cost.is_paid) return
    const val = parseFloat(editValues[cost._id] ?? '')
    if (!isNaN(val) && val !== cost.monthly_cost_usd) save(cost, true, val)
  }

  const categories = [...new Set(costs.map(c => c.category))]
  const total = costs.reduce((s, c) => s + (c.is_paid ? c.monthly_cost_usd : 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-fore">Custos mensais de operação — alterne entre Gratuito / Pago e edite o valor</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map(cat => {
          const subtotal = costs.filter(c => c.category === cat && c.is_paid).reduce((s, c) => s + c.monthly_cost_usd, 0)
          return (
            <Card key={cat}>
              <CardBody className="text-center py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[cat] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {cat}
                </span>
                <p className="text-base font-bold text-foreground mt-2">
                  {subtotal === 0 ? <span className="text-emerald-400 text-sm">Gratuito</span> : formatCurrency(subtotal)}
                </p>
                <p className="text-[10px] text-muted-fore">/mês</p>
              </CardBody>
            </Card>
          )
        })}
        <Card className="border-primary/30 bg-primary/5">
          <CardBody className="text-center py-3">
            <span className="text-xs px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">Total</span>
            <p className="text-base font-bold text-primary mt-2">{formatCurrency(total)}</p>
            <p className="text-[10px] text-muted-fore">/mês</p>
          </CardBody>
        </Card>
      </div>

      {/* Tabela editável */}
      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-fore uppercase tracking-wide">Serviço</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-fore uppercase tracking-wide">Plano</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-fore uppercase tracking-wide">Mensal (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {costs.map(cost => (
                <tr key={cost._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{cost.label}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[cost.category] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {cost.category}
                    </span>
                  </td>

                  {/* Toggle Free / Paid */}
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex rounded-lg border border-border overflow-hidden text-xs">
                      <button
                        onClick={() => cost.is_paid && handleToggle(cost, false)}
                        disabled={saving === cost._id}
                        className={`px-3 py-1.5 font-medium transition-colors ${
                          !cost.is_paid ? 'bg-emerald-500/15 text-emerald-400' : 'text-muted-fore hover:bg-muted'
                        }`}
                      >
                        Gratuito
                      </button>
                      <button
                        onClick={() => !cost.is_paid && handleToggle(cost, true)}
                        disabled={saving === cost._id}
                        className={`px-3 py-1.5 font-medium transition-colors border-l border-border ${
                          cost.is_paid ? 'bg-amber-500/15 text-amber-400' : 'text-muted-fore hover:bg-muted'
                        }`}
                      >
                        Pago
                      </button>
                    </div>
                  </td>

                  {/* Valor editável */}
                  <td className="px-4 py-3 text-right">
                    {cost.is_paid ? (
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <span className="text-muted-fore text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editValues[cost._id] ?? cost.monthly_cost_usd}
                          onChange={e => setEditValues(v => ({ ...v, [cost._id]: e.target.value }))}
                          onBlur={() => handleValueBlur(cost)}
                          onKeyDown={e => e.key === 'Enter' && (e.currentTarget.blur())}
                          className="w-20 text-right bg-muted border border-border rounded-md px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {saving === cost._id
                          ? <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                          : <IonIcon name="checkmark-outline" size={12} className="text-muted-fore shrink-0" />
                        }
                      </div>
                    ) : (
                      <span className="text-emerald-400 text-xs font-semibold">Gratuito</span>
                    )}
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
