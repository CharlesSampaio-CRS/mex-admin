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
  is_verified:          boolean
}

export interface DashboardStats {
  total_users:      number
  free_users:       number
  pro_users:        number
  premium_users:    number
  total_tickets:    number
  open_tickets:     number
  mrr_estimate:     number
  active_exchanges: number
  new_users_7d:     number
  new_users_30d:    number
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
  comments?:     TicketComment[]
}

export interface TicketComment {
  id:         string
  text:       string
  author:     string
  is_admin:   boolean
  created_at: number
}

export interface JobStatus {
  job_id:       string
  name:         string
  status:       'running' | 'idle' | 'error' | 'success'
  last_run:     string | null
  next_run:     string | null
  runs_today:   number
  last_error?:  string
  error?:       string
}

export interface CostItem {
  name:        string
  category:    string
  monthly_usd: number
  description: string
}

export interface ExchangeStats {
  exchange_id:  string
  name:         string
  user_count:   number
  active_count: number
}
