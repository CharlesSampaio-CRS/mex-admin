// ── Tipos compartilhados do portal admin ─────────────────────────────────────

export type Plan = 'free' | 'pro' | 'premium'

export interface AdminUser {
  user_id:              string
  email:                string
  name:                 string
  roles:                string[]
  subscription_plan:    Plan
  subscription_expires_at?: string
  created_at:           string
  last_login_at?:       string
  expo_push_token?:     string
  exchange_count:       number
  exchanges:            string[]
  email_verified:       boolean
  is_verified?:         boolean  // alias legado — usar email_verified
  avatar?:              string
  is_active?:           boolean
  open_tickets?:        number
}

export interface ExchangeStats {
  exchange_id:   string
  name:          string
  user_count:    number
  active_count:  number
}

export interface JobStatus {
  job_id:      string
  name:        string
  status:      'running' | 'idle' | 'error' | 'success'
  last_run:    string | null
  next_run:    string | null
  runs_today:  number
  last_error?: string
  error?:      string
}

export interface DashboardStats {
  // Usuários
  total_users:       number
  active_users:      number
  blocked_users:     number
  verified_users:    number
  totp_users:        number
  new_users_7d:      number
  new_users_30d:     number
  // Planos
  free_users:        number
  pro_users:         number
  premium_users:     number
  // MRR
  mrr_estimate:      number
  // Suporte
  total_tickets:     number
  open_tickets:      number
  in_progress_tickets: number
  resolved_tickets:  number
  // Exchanges
  active_exchanges:  number
  exchanges:         ExchangeStats[]
  // Estratégias
  total_strategies:  number
  active_strategies: number
  // Jobs
  jobs:              JobStatus[]
}

export interface SupportTicket {
  id:            string
  protocol:      string
  user_id:       string
  email:         string
  name:          string
  subject_id:    string
  subject_label: string
  category:      string
  message:       string
  status:        'open' | 'in_progress' | 'resolved' | 'cancelled'
  created_at:    number
  updated_at:    number
  sla_hours:     number
  sla_deadline:  number
  admin_reply?:  string
  attachments?:  string[]
  comments?:     TicketComment[]
}

export interface TicketComment {
  id:           string
  text:         string
  author:       string
  is_admin:     boolean
  created_at:   number
  attachments?: string[]
}

export interface CostItem {
  name:        string
  category:    string
  monthly_usd: number
  description: string
}

export interface CatalogExchange {
  id:       string
  ccxt_id:  string
  name:     string
  logo_url?: string
  url?:     string
  pais_de_origem?: string
  is_active: boolean
  supports_spot?: boolean
  supports_futures?: boolean
  requires_passphrase?: boolean
  passphrase_label?: string
  passphrase_placeholder?: string
  requires_uid?: boolean
  uid_label?: string
  uid_placeholder?: string
  api_key_expiry_days?: number
}

export interface JobExecution {
  id:           string
  job_name:     string
  status:       'running' | 'success' | 'error'
  started_at:   number   // unix ms
  finished_at?: number
  duration_ms?: number
  triggered_by: string
  error_msg?:   string
}

