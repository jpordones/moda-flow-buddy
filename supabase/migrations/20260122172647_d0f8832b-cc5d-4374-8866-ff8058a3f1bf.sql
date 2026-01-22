-- Add stripe_price_id to plans table if not exists
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS stripe_price_id text,
ADD COLUMN IF NOT EXISTS stripe_product_id text,
ADD COLUMN IF NOT EXISTS has_ai_features boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_integrations boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_api_access boolean DEFAULT false;

-- Update plans with Stripe IDs
UPDATE public.plans SET 
  stripe_price_id = 'price_1SmvnbEnIl17o7v12slvumEl',
  stripe_product_id = 'prod_TkQezjupyhbVqv',
  has_ai_features = false,
  has_integrations = false
WHERE type = 'starter';

UPDATE public.plans SET 
  stripe_price_id = 'price_1SmvzKEnIl17o7v1BtzYcs1w',
  stripe_product_id = 'prod_TkQrjKBmFDU0aW',
  has_ai_features = true,
  has_integrations = true
WHERE type = 'professional';

UPDATE public.plans SET 
  stripe_price_id = 'price_1SmvzaEnIl17o7v1tSbcLM3s',
  stripe_product_id = 'prod_TkQriZDjoN79WT',
  has_ai_features = true,
  has_integrations = true,
  has_api_access = true
WHERE type = 'enterprise';

-- Create payment_history table for tracking all payments
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'BRL',
  status text NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded', 'canceled')),
  description text,
  invoice_pdf_url text,
  receipt_url text,
  failure_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice_id ON public.payment_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- Enable RLS on payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Add cancel_at_period_end to user_subscriptions if not exists
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone;