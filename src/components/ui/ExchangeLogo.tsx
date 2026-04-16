/** Mapa de exchange_id/nome → arquivo de ícone */
const EXCHANGE_ICONS: Record<string, string> = {
  binance:   '/icons/binance.png',
  bitget:    '/icons/bitget.png',
  bitmart:   '/icons/bitmart.png',
  bybit:     '/icons/bybit.png',
  coinbase:  '/icons/coinbase.png',
  coinex:    '/icons/coinex.png',
  gateio:    '/icons/gateio.png',
  gate:      '/icons/gateio.png',
  kraken:    '/icons/kraken.png',
  kucoin:    '/icons/kucoin.png',
  mercado:   '/icons/mercado.png',
  mexc:      '/icons/mexc.png',
  novadax:   '/icons/novadax.png',
  okx:       '/icons/okx.png',
}

interface ExchangeLogoProps {
  exchangeId: string
  name:       string
  size?:      number
  className?: string
}

export function ExchangeLogo({ exchangeId, name, size = 32, className }: ExchangeLogoProps) {
  const key = exchangeId.toLowerCase().replace(/[^a-z]/g, '')
  const src = EXCHANGE_ICONS[key]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-lg object-contain bg-white dark:bg-white/10 p-0.5 ${className ?? ''}`}
        style={{ width: size, height: size }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  // Fallback: círculo com inicial
  return (
    <div
      className={`rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size, background: '#7c6af7' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
