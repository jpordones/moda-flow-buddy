-- Adicionar campos faltantes na tabela profiles para configurações completas

-- Campos de contato e endereço
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text;

-- Campos de configuração fiscal
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tax_regime text DEFAULT 'simples_nacional',
ADD COLUMN IF NOT EXISTS state_tax numeric(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS municipal_tax numeric(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_taxes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tax_breakdown jsonb DEFAULT '[
  {"id": "1", "name": "ICMS", "percentage": 18, "enabled": false},
  {"id": "2", "name": "PIS", "percentage": 1.65, "enabled": false},
  {"id": "3", "name": "COFINS", "percentage": 7.6, "enabled": false},
  {"id": "4", "name": "ISS", "percentage": 5, "enabled": false}
]'::jsonb;

-- Campos de configuração de cálculo
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_unit text DEFAULT 'un',
ADD COLUMN IF NOT EXISTS custom_unit_label text DEFAULT 'Peça',
ADD COLUMN IF NOT EXISTS default_premium_margin numeric(5,2) DEFAULT 50,
ADD COLUMN IF NOT EXISTS default_monthly_sales integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS default_markup_rate numeric(5,2) DEFAULT 0;

-- Campos de alertas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS enable_stock_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS critical_stock_threshold integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS low_margin_alert boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS low_margin_threshold numeric(5,2) DEFAULT 10,
ADD COLUMN IF NOT EXISTS below_cost_alert boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS below_cost_buffer numeric(5,2) DEFAULT 5,
ADD COLUMN IF NOT EXISTS monthly_review_reminder boolean DEFAULT false;

-- Campos de exportação
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS export_include_logo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS export_include_company_info boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS export_include_cost_breakdown boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS export_include_charts boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS export_filename_pattern text DEFAULT 'relatorio-{type}-{date}',
ADD COLUMN IF NOT EXISTS export_pdf_color_scheme text DEFAULT 'default';

-- Campos de moeda
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency_symbol text DEFAULT 'R$',
ADD COLUMN IF NOT EXISTS decimal_separator text DEFAULT ',',
ADD COLUMN IF NOT EXISTS thousand_separator text DEFAULT '.',
ADD COLUMN IF NOT EXISTS decimal_places integer DEFAULT 2;