import { TOOLS } from '@/lib/tools'
import { IonIcon } from '@/components/ui/IonIcon'

const CATEGORIES = [...new Set(TOOLS.map(t => t.category))]

export function WebViewsPage() {
  return (
    <div className="space-y-8">
      {CATEGORIES.map(cat => (
        <div key={cat}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-fore mb-3">{cat}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOOLS.filter(t => t.category === cat).map(tool => (
              <a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${tool.color}18`, border: `1.5px solid ${tool.color}35` }}
                >
                  {tool.imgIcon
                    ? <img src={tool.imgIcon} alt={tool.label} className="w-9 h-9 rounded-xl object-cover" />
                    : <IonIcon name={tool.icon as any} size={28} style={{ color: tool.color }} />
                  }
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground leading-tight">{tool.label}</p>
                </div>

                {/* Custo mensal */}
                {tool.monthlyCostUSD !== undefined && (
                  <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    tool.monthlyCostUSD === 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {tool.monthlyCostUSD === 0 ? 'Gratuito' : `$${tool.monthlyCostUSD}/mês`}
                  </div>
                )}

                <div className="flex items-center gap-1 text-[10px] text-muted-fore group-hover:text-primary transition-colors">
                  <IonIcon name="open-outline" size={10} />
                  <span>Abrir</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
