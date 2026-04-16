import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  accent?: boolean
}

export function Card({ children, className, accent }: CardProps) {
  return (
    <div className={cn(
      'rounded-2xl border bg-white dark:bg-surface border-gray-200 dark:border-white/8 overflow-hidden',
      className
    )}>
      {accent && (
        <div className="h-[3px] bg-gradient-to-r from-primary to-primary/30" />
      )}
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-white/8', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
