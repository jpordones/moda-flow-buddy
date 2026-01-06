
-- Tabela de custos (fixos e variáveis)
CREATE TABLE public.costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'month',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de transações (fluxo de caixa)
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações por equipe
CREATE TABLE public.team_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  default_currency TEXT NOT NULL DEFAULT 'BRL',
  default_margin NUMERIC DEFAULT 30,
  tax_regime TEXT DEFAULT 'simples_nacional',
  tax_rate NUMERIC DEFAULT 0,
  fiscal_year_start INTEGER DEFAULT 1,
  low_stock_threshold INTEGER DEFAULT 10,
  enable_notifications BOOLEAN DEFAULT true,
  enable_email_alerts BOOLEAN DEFAULT false,
  backup_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para costs
CREATE POLICY "Users can view their team's costs"
  ON public.costs FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert costs for their team"
  ON public.costs FOR INSERT
  WITH CHECK (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update their team's costs"
  ON public.costs FOR UPDATE
  USING (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete their team's costs"
  ON public.costs FOR DELETE
  USING (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Políticas RLS para transactions
CREATE POLICY "Users can view their team's transactions"
  ON public.transactions FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert transactions for their team"
  ON public.transactions FOR INSERT
  WITH CHECK (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update their team's transactions"
  ON public.transactions FOR UPDATE
  USING (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete their team's transactions"
  ON public.transactions FOR DELETE
  USING (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Políticas RLS para team_settings
CREATE POLICY "Users can view their team's settings"
  ON public.team_settings FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Team managers can insert settings"
  ON public.team_settings FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR public.has_min_role(auth.uid(), team_id, 'manager')
  );

CREATE POLICY "Team managers can update settings"
  ON public.team_settings FOR UPDATE
  USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR public.has_min_role(auth.uid(), team_id, 'manager')
  );

-- Triggers para updated_at
CREATE TRIGGER update_costs_updated_at
  BEFORE UPDATE ON public.costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_settings_updated_at
  BEFORE UPDATE ON public.team_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_costs_team_id ON public.costs(team_id);
CREATE INDEX idx_transactions_team_id ON public.transactions(team_id);
CREATE INDEX idx_transactions_reference_date ON public.transactions(reference_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
