import { cn } from '@/lib/utils'

interface IonIconProps {
  name: string
  size?: number | string
  className?: string
  style?: React.CSSProperties
}

/**
 * Wrapper para o web component <ion-icon> do Ionicons v7.
 * Use nomes com sufixo -outline, -sharp ou sem sufixo (filled).
 * Exemplos: "home-outline", "people-sharp", "settings"
 */
export function IonIcon({ name, size = 18, className, style }: IonIconProps) {
  return (
    <ion-icon
      name={name}
      style={{ fontSize: typeof size === 'number' ? `${size}px` : size, ...style }}
      class={cn('block shrink-0', className)}
    />
  )
}
