-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  cost_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 10,
  unit TEXT NOT NULL DEFAULT 'un',
  size TEXT,
  color TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint for SKU within a team
ALTER TABLE public.products ADD CONSTRAINT products_team_sku_unique UNIQUE (team_id, sku);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products (users can only access their team's products)
CREATE POLICY "Users can view their team's products" 
ON public.products 
FOR SELECT 
USING (
  team_id IN (
    SELECT team_id FROM public.user_roles WHERE user_id = auth.uid()
  )
  OR
  team_id IN (
    SELECT id FROM public.teams WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert products for their team" 
ON public.products 
FOR INSERT 
WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.user_roles WHERE user_id = auth.uid()
  )
  OR
  team_id IN (
    SELECT id FROM public.teams WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their team's products" 
ON public.products 
FOR UPDATE 
USING (
  team_id IN (
    SELECT team_id FROM public.user_roles WHERE user_id = auth.uid()
  )
  OR
  team_id IN (
    SELECT id FROM public.teams WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their team's products" 
ON public.products 
FOR DELETE 
USING (
  team_id IN (
    SELECT team_id FROM public.user_roles WHERE user_id = auth.uid()
  )
  OR
  team_id IN (
    SELECT id FROM public.teams WHERE owner_id = auth.uid()
  )
);

-- Create trigger to update updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create stock_movements table for tracking inventory changes
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Policies for stock_movements
CREATE POLICY "Users can view their team's stock movements" 
ON public.stock_movements 
FOR SELECT 
USING (
  team_id IN (
    SELECT team_id FROM public.user_roles WHERE user_id = auth.uid()
  )
  OR
  team_id IN (
    SELECT id FROM public.teams WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert stock movements for their team" 
ON public.stock_movements 
FOR INSERT 
WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.user_roles WHERE user_id = auth.uid()
  )
  OR
  team_id IN (
    SELECT id FROM public.teams WHERE owner_id = auth.uid()
  )
);