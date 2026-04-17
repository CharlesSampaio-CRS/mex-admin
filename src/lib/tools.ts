export interface Tool {
  id:              string
  label:           string
  url:             string
  icon:            string
  color:           string
  category:        string
  noEmbed?:        boolean   // bloqueia iframe (X-Frame-Options / CSP)
  monthlyCostUSD?: number    // custo mensal em USD (0 = gratuito, undefined = não monitorado)
}

export const TOOLS: Tool[] = [
  // Infra
  { id: 'aws',        label: 'AWS Console',        url: 'https://console.aws.amazon.com',                    icon: 'cloud-outline',           color: '#f59e0b', category: 'Infra',    noEmbed: true,  monthlyCostUSD: 35   },
  { id: 'gcp',        label: 'Google Cloud',       url: 'https://console.cloud.google.com',                  icon: 'cloud-done-outline',      color: '#34d399', category: 'Infra',    noEmbed: true,  monthlyCostUSD: 0    },
  { id: 'cloudflare', label: 'Cloudflare',         url: 'https://dash.cloudflare.com',                       icon: 'shield-outline',          color: '#f97316', category: 'Infra',    noEmbed: true,  monthlyCostUSD: 0    },
  { id: 'grafana',    label: 'Grafana',            url: 'https://grafana.com/auth/sign-in',                  icon: 'pulse-outline',           color: '#ff6600', category: 'Infra',                    monthlyCostUSD: 0    },
  { id: 'mongo',      label: 'MongoDB Atlas',      url: 'https://cloud.mongodb.com',                         icon: 'server-outline',          color: '#10b981', category: 'Infra',    noEmbed: true,  monthlyCostUSD: 57   },
  { id: 'redis',      label: 'Redis Cloud',        url: 'https://app.redislabs.com',                         icon: 'layers-outline',          color: '#ef4444', category: 'Infra',    noEmbed: true,  monthlyCostUSD: 10   },
  { id: 'hostinger',  label: 'Hostinger',          url: 'https://hpanel.hostinger.com',                      icon: 'globe-outline',           color: '#7c3aed', category: 'Infra',    noEmbed: true,  monthlyCostUSD: 3    },

  // Dev
  { id: 'github',     label: 'GitHub',             url: 'https://github.com/CharlesSampaio-CRS',             icon: 'logo-github',             color: '#e5e7eb', category: 'Dev',      noEmbed: true,  monthlyCostUSD: 0    },
  { id: 'expo',       label: 'Expo / EAS',         url: 'https://expo.dev/accounts/mex-unified-app',         icon: 'phone-portrait-outline',  color: '#6366f1', category: 'Dev',                      monthlyCostUSD: 29   },
  { id: 'coingecko',  label: 'CoinGecko API',      url: 'https://www.coingecko.com/en/api/documentation',    icon: 'analytics-outline',       color: '#84cc16', category: 'Dev',      noEmbed: true,  monthlyCostUSD: 0    },

  // Stores & Monetização
  { id: 'gplay',      label: 'Google Play',        url: 'https://play.google.com/console',                   icon: 'logo-google-playstore',   color: '#3b82f6', category: 'Stores',   noEmbed: true,  monthlyCostUSD: 0    },
  { id: 'admob',      label: 'AdMob',              url: 'https://admob.google.com',                          icon: 'megaphone-outline',       color: '#facc15', category: 'Stores',   noEmbed: true,  monthlyCostUSD: 0    },
  { id: 'revenuecat', label: 'RevenueCat',         url: 'https://app.revenuecat.com',                        icon: 'card-outline',            color: '#a855f7', category: 'Stores',   noEmbed: true,  monthlyCostUSD: 0    },

  // Site & Ferramentas
  { id: 'site',       label: 'mex.app.br',         url: 'https://mex.app.br',                                icon: 'earth-outline',           color: '#06b6d4', category: 'Site',                     monthlyCostUSD: 0    },
  { id: 'conversor',  label: 'USD → BRL',          url: 'https://www.google.com/search?q=dolar+hoje',        icon: 'swap-horizontal-outline', color: '#22d3ee', category: 'Site',     noEmbed: true,  monthlyCostUSD: 0    },
]
