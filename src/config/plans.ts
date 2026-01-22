import { PlanType } from '@/types/subscription';

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  description: string;
  badge?: string;
  roi?: string;
  features: {
    max_products: number;
    max_users: number;
    max_cost_analyses: number;
    has_basic_dashboard: boolean;
    has_full_dashboard: boolean;
    has_cash_flow: boolean;
    has_export_pdf: boolean;
    has_export_excel: boolean;
    has_stock_management: boolean;
    has_advanced_stock: boolean;
    has_basic_lamar: boolean;
    has_full_lamar: boolean;
    has_ai_demand_forecast: boolean;
    has_ai_dynamic_pricing: boolean;
    has_integrations: boolean;
    has_multi_teams: boolean;
    has_multi_stores: boolean;
    has_api_access: boolean;
    has_webhooks: boolean;
    has_white_label: boolean;
    has_watermark_reports: boolean;
    has_email_support: boolean;
    has_priority_support: boolean;
    has_dedicated_manager: boolean;
    has_sla_support: boolean;
    has_whatsapp_support: boolean;
    has_onboarding_consultation: boolean;
    has_custom_onboarding: boolean;
  };
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    stripe_price_id: null,
    stripe_product_id: null,
    description: 'Para experimentar',
    features: {
      max_products: 5,
      max_users: 1,
      max_cost_analyses: 10,
      has_basic_dashboard: true,
      has_full_dashboard: false,
      has_cash_flow: false,
      has_export_pdf: false,
      has_export_excel: false,
      has_stock_management: false,
      has_advanced_stock: false,
      has_basic_lamar: true,
      has_full_lamar: false,
      has_ai_demand_forecast: false,
      has_ai_dynamic_pricing: false,
      has_integrations: false,
      has_multi_teams: false,
      has_multi_stores: false,
      has_api_access: false,
      has_webhooks: false,
      has_white_label: false,
      has_watermark_reports: true,
      has_email_support: false,
      has_priority_support: false,
      has_dedicated_manager: false,
      has_sla_support: false,
      has_whatsapp_support: false,
      has_onboarding_consultation: false,
      has_custom_onboarding: false,
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 149,
    stripe_price_id: 'price_1SmvnbEnIl17o7v12slvumEl',
    stripe_product_id: 'prod_TkQezjupyhbVqv',
    description: 'Para pequenos negócios',
    roi: 'Economize até R$ 500/mês em planilhas e erros',
    features: {
      max_products: 50,
      max_users: 2,
      max_cost_analyses: -1, // ilimitado
      has_basic_dashboard: true,
      has_full_dashboard: true,
      has_cash_flow: true,
      has_export_pdf: true,
      has_export_excel: true,
      has_stock_management: true,
      has_advanced_stock: true,
      has_basic_lamar: true,
      has_full_lamar: true,
      has_ai_demand_forecast: false,
      has_ai_dynamic_pricing: false,
      has_integrations: false,
      has_multi_teams: false,
      has_multi_stores: false,
      has_api_access: false,
      has_webhooks: false,
      has_white_label: false,
      has_watermark_reports: false,
      has_email_support: true,
      has_priority_support: false,
      has_dedicated_manager: false,
      has_sla_support: false,
      has_whatsapp_support: false,
      has_onboarding_consultation: false,
      has_custom_onboarding: false,
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 299,
    stripe_price_id: 'price_1SmvzKEnIl17o7v1BtzYcs1w',
    stripe_product_id: 'prod_TkQrjKBmFDU0aW',
    description: 'Para equipes em crescimento',
    badge: '🔥 MAIS ESCOLHIDO',
    roi: 'Aumente margem média em 18% = +R$ 15k/mês',
    features: {
      max_products: 200,
      max_users: 5,
      max_cost_analyses: -1,
      has_basic_dashboard: true,
      has_full_dashboard: true,
      has_cash_flow: true,
      has_export_pdf: true,
      has_export_excel: true,
      has_stock_management: true,
      has_advanced_stock: true,
      has_basic_lamar: true,
      has_full_lamar: true,
      has_ai_demand_forecast: true,
      has_ai_dynamic_pricing: true,
      has_integrations: true,
      has_multi_teams: true,
      has_multi_stores: false,
      has_api_access: false,
      has_webhooks: false,
      has_white_label: false,
      has_watermark_reports: false,
      has_email_support: true,
      has_priority_support: true,
      has_dedicated_manager: false,
      has_sla_support: false,
      has_whatsapp_support: false,
      has_onboarding_consultation: true,
      has_custom_onboarding: false,
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    stripe_price_id: 'price_1SmvzaEnIl17o7v1tSbcLM3s',
    stripe_product_id: 'prod_TkQriZDjoN79WT',
    description: 'Para grandes empresas',
    badge: '👑 PARA ESCALAR',
    roi: 'Para faturamentos acima de R$ 100k/mês',
    features: {
      max_products: -1, // ilimitado
      max_users: -1, // ilimitado
      max_cost_analyses: -1,
      has_basic_dashboard: true,
      has_full_dashboard: true,
      has_cash_flow: true,
      has_export_pdf: true,
      has_export_excel: true,
      has_stock_management: true,
      has_advanced_stock: true,
      has_basic_lamar: true,
      has_full_lamar: true,
      has_ai_demand_forecast: true,
      has_ai_dynamic_pricing: true,
      has_integrations: true,
      has_multi_teams: true,
      has_multi_stores: true,
      has_api_access: true,
      has_webhooks: true,
      has_white_label: true,
      has_watermark_reports: false,
      has_email_support: true,
      has_priority_support: true,
      has_dedicated_manager: true,
      has_sla_support: true,
      has_whatsapp_support: true,
      has_onboarding_consultation: true,
      has_custom_onboarding: true,
    }
  }
};

export const getPlanByPriceId = (priceId: string): PlanConfig | undefined => {
  return Object.values(PLANS).find(plan => plan.stripe_price_id === priceId);
};

export const getPlanByProductId = (productId: string): PlanConfig | undefined => {
  return Object.values(PLANS).find(plan => plan.stripe_product_id === productId);
};
