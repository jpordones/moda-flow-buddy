-- Create order_status enum type
CREATE TYPE order_status AS ENUM (
  'novo',
  'aguardando_pagamento',
  'pago',
  'em_producao',
  'personalizacao_pendente',
  'separando',
  'pronto_envio',
  'enviado',
  'entregue',
  'cancelado',
  'devolvido',
  'em_estoque',
  'problema'
);

-- Create payment_status enum type
CREATE TYPE payment_status AS ENUM (
  'pendente',
  'pago',
  'parcial',
  'estornado',
  'cancelado'
);

-- Create payment_method enum type
CREATE TYPE payment_method AS ENUM (
  'pix',
  'cartao',
  'dinheiro',
  'boleto',
  'transferencia',
  'outro'
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_contact TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  payment_method payment_method NOT NULL DEFAULT 'pix',
  payment_status payment_status NOT NULL DEFAULT 'pendente',
  installments_count INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  order_status order_status NOT NULL DEFAULT 'novo',
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  base_color TEXT,
  size TEXT,
  print_variant TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_orders_team_id ON public.orders(team_id);
CREATE INDEX idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX idx_orders_order_status ON public.orders(order_status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_customer_name ON public.orders(customer_name);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Users can view their team's orders"
ON public.orders FOR SELECT
USING (
  team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can insert orders for their team"
ON public.orders FOR INSERT
WITH CHECK (
  team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can update their team's orders"
ON public.orders FOR UPDATE
USING (
  team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Team admins and managers can delete orders"
ON public.orders FOR DELETE
USING (
  is_team_owner(auth.uid(), team_id) 
  OR has_min_role(auth.uid(), team_id, 'manager'::app_role)
);

-- RLS policies for order_items
CREATE POLICY "Users can view their team's order items"
ON public.order_items FOR SELECT
USING (
  team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can insert order items for their team"
ON public.order_items FOR INSERT
WITH CHECK (
  team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can update their team's order items"
ON public.order_items FOR UPDATE
USING (
  team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can delete their team's order items"
ON public.order_items FOR DELETE
USING (
  team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

-- Trigger to update updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();