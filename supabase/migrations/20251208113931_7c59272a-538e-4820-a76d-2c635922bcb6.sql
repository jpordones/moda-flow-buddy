-- Create enum for plan types
CREATE TYPE public.plan_type AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- Create plans table with features and limits
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type plan_type NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  max_products INTEGER NOT NULL DEFAULT 5,
  max_cost_analyses INTEGER NOT NULL DEFAULT 10,
  has_export_pdf BOOLEAN NOT NULL DEFAULT false,
  has_export_excel BOOLEAN NOT NULL DEFAULT false,
  has_stock_management BOOLEAN NOT NULL DEFAULT false,
  has_cash_flow BOOLEAN NOT NULL DEFAULT false,
  has_reports BOOLEAN NOT NULL DEFAULT false,
  has_multi_users BOOLEAN NOT NULL DEFAULT false,
  max_users INTEGER NOT NULL DEFAULT 1,
  has_priority_support BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on plans (public read)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
ON public.plans
FOR SELECT
USING (true);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans
INSERT INTO public.plans (name, type, price, max_products, max_cost_analyses, has_export_pdf, has_export_excel, has_stock_management, has_cash_flow, has_reports, has_multi_users, max_users, has_priority_support)
VALUES 
  ('Gratuito', 'free', 0, 5, 10, false, false, false, false, false, false, 1, false),
  ('Starter', 'starter', 29.90, 25, 50, true, false, true, false, false, false, 1, false),
  ('Professional', 'professional', 79.90, 100, 200, true, true, true, true, true, true, 5, true),
  ('Enterprise', 'enterprise', 199.90, -1, -1, true, true, true, true, true, true, -1, true);

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id UUID)
RETURNS TABLE (
  plan_id UUID,
  plan_name TEXT,
  plan_type plan_type,
  max_products INTEGER,
  max_cost_analyses INTEGER,
  has_export_pdf BOOLEAN,
  has_export_excel BOOLEAN,
  has_stock_management BOOLEAN,
  has_cash_flow BOOLEAN,
  has_reports BOOLEAN,
  has_multi_users BOOLEAN,
  max_users INTEGER,
  has_priority_support BOOLEAN,
  subscription_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as plan_id,
    p.name as plan_name,
    p.type as plan_type,
    p.max_products,
    p.max_cost_analyses,
    p.has_export_pdf,
    p.has_export_excel,
    p.has_stock_management,
    p.has_cash_flow,
    p.has_reports,
    p.has_multi_users,
    p.max_users,
    p.has_priority_support,
    COALESCE(us.status, 'none') as subscription_status
  FROM public.plans p
  LEFT JOIN public.user_subscriptions us ON us.plan_id = p.id AND us.user_id = p_user_id
  WHERE p.type = 'free' OR us.user_id = p_user_id
  ORDER BY us.user_id DESC NULLS LAST
  LIMIT 1;
END;
$$;

-- Function to assign free plan to new users (update existing trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  -- Get free plan id
  SELECT id INTO free_plan_id FROM public.plans WHERE type = 'free' LIMIT 1;
  
  -- Assign free plan to new user
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status)
    VALUES (new.id, free_plan_id, 'active');
  END IF;
  
  RETURN new;
END;
$$;