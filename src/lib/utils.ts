import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(ts: number | string) {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  return format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export function formatRelative(ts: number | string) {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function planLabel(plan: string) {
  return { free: 'Free', pro: 'Pro', premium: 'Premium' }[plan] ?? plan
}

export function planColor(plan: string) {
  return {
    free:    'text-gray-400 bg-gray-400/10 border-gray-400/20',
    pro:     'text-blue-400 bg-blue-400/10 border-blue-400/20',
    premium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  }[plan] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'
}

export function statusColor(status: string) {
  return {
    open:        'text-blue-400 bg-blue-400/10 border-blue-400/20',
    in_progress: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    resolved:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    cancelled:   'text-gray-400 bg-gray-400/10 border-gray-400/20',
  }[status] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'
}

export function statusLabel(status: string) {
  return {
    open:        'Aberto',
    in_progress: 'Em análise',
    resolved:    'Resolvido',
    cancelled:   'Cancelado',
  }[status] ?? status
}
