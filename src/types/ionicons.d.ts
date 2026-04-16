// Declaração de tipo para o web component ion-icon (Ionicons v7)
declare namespace JSX {
  interface IntrinsicElements {
    'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      name?: string
      src?: string
      size?: 'small' | 'large'
      color?: string
      ios?: string
      md?: string
      lazy?: boolean
      flipRtl?: boolean
      class?: string
    }
  }
}
