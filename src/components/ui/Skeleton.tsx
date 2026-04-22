import { cn } from '@/lib/utils'

/**
 * Skeleton base — retângulo com shimmer suave. Evita o flash de tela branca
 * enquanto o conteúdo carrega do backend.
 *
 * Uso:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-48 w-full rounded-xl" />
 */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        'relative overflow-hidden rounded-md bg-muted/60',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'before:animate-[shimmer_1.4s_infinite]',
        className,
      )}
    />
  )
}

/** Skeleton de linha de texto com altura padrão */
export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn('h-3.5 w-full', className)} />
}

/** Card de estatística */
export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

/** Grid de cards menores */
export function SkeletonMiniCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
      <Skeleton className="w-6 h-6 rounded" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  )
}

/** Card quadrado de exchange (com ícone grande) */
export function SkeletonExchangeCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2">
      <Skeleton className="w-9 h-9 rounded-lg" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-2.5 w-10" />
      <Skeleton className="h-4 w-14 rounded-full mt-1" />
    </div>
  )
}

/** Placeholder de gráfico */
export function SkeletonChart({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  )
}
