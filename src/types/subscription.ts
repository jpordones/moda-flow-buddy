export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  max_products: number;
  max_cost_analyses: number;
  has_export_pdf: boolean;
  has_export_excel: boolean;
  has_stock_management: boolean;
  has_cash_flow: boolean;
  has_reports: boolean;
  has_multi_users: boolean;
  max_users: number;
  has_priority_support: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPlan {
  plan_id: string;
  plan_name: string;
  plan_type: PlanType;
  max_products: number;
  max_cost_analyses: number;
  has_export_pdf: boolean;
  has_export_excel: boolean;
  has_stock_management: boolean;
  has_cash_flow: boolean;
  has_reports: boolean;
  has_multi_users: boolean;
  max_users: number;
  has_priority_support: boolean;
  subscription_status: string;
}

export interface PlanFeature {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}
