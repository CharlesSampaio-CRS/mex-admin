import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info'
type BadgeSize = 'sm' | 'md'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-fore border-border',
  success: 'bg-success/10 text-success border-success/20',
  danger:  'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info:    'bg-primary/10 text-primary border-primary/20',
}

interface BadgeProps {
  children:  ReactNode
  className?: string
  dot?:       boolean
  variant?:   BadgeVariant
  size?:      BadgeSize
}

export function Badge({ children, className, dot, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
      VARIANT_CLASSES[variant],
      className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}
