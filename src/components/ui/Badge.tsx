import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info'
type BadgeSize = 'sm' | 'md'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10',
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  danger:  'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  info:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
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
