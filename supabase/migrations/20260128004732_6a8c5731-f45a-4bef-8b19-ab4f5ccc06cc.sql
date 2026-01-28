-- =====================================================
-- TABELA: pricing_settings
-- Armazena configurações de precificação por equipe
-- =====================================================
CREATE TABLE public.pricing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id)
);

-- Enable RLS
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their team's pricing settings"
ON public.pricing_settings
FOR SELECT
USING (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

CREATE POLICY "Users can insert pricing settings for their team"
ON public.pricing_settings
FOR INSERT
WITH CHECK (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

CREATE POLICY "Users can update their team's pricing settings"
ON public.pricing_settings
FOR UPDATE
USING (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

-- Trigger for updated_at
CREATE TRIGGER update_pricing_settings_updated_at
BEFORE UPDATE ON public.pricing_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: demand_forecast_history
-- Armazena histórico de previsões de demanda
-- =====================================================
CREATE TABLE public.demand_forecast_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  period_months INTEGER NOT NULL DEFAULT 6,
  method TEXT NOT NULL,
  accuracy NUMERIC,
  trend_direction TEXT,
  trend_rate NUMERIC,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demand_forecast_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their team's forecast history"
ON public.demand_forecast_history
FOR SELECT
USING (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

CREATE POLICY "Users can insert forecast history for their team"
ON public.demand_forecast_history
FOR INSERT
WITH CHECK (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

CREATE POLICY "Users can delete their team's forecast history"
ON public.demand_forecast_history
FOR DELETE
USING (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

-- Index for faster queries
CREATE INDEX idx_demand_forecast_history_team_id ON public.demand_forecast_history(team_id);
CREATE INDEX idx_demand_forecast_history_product_id ON public.demand_forecast_history(product_id);
CREATE INDEX idx_demand_forecast_history_created_at ON public.demand_forecast_history(created_at DESC);