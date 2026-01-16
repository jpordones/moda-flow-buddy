-- =========================================
-- REESTRUTURAÇÃO: PRODUTOS vs ESTOQUE
-- =========================================

-- 1. Criar tabela inventory_items para estoque por variação
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  
  -- Variação específica
  size TEXT,
  color TEXT,
  
  -- Quantidades
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INTEGER NOT NULL DEFAULT 5,
  critical_stock INTEGER NOT NULL DEFAULT 2,
  
  -- Localização (futuro multi-depósito)
  location TEXT DEFAULT 'Principal',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint única: não pode ter 2 registros iguais
  UNIQUE(product_id, size, color, location)
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_team ON public.inventory_items(team_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON public.inventory_items(quantity) WHERE quantity <= 5;

-- 3. Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies para inventory_items
CREATE POLICY "Users can view their team inventory"
ON public.inventory_items FOR SELECT
USING (
  team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can insert inventory for their team"
ON public.inventory_items FOR INSERT
WITH CHECK (
  team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can update their team inventory"
ON public.inventory_items FOR UPDATE
USING (
  team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can delete their team inventory"
ON public.inventory_items FOR DELETE
USING (
  team_id IN (SELECT team_id FROM public.user_roles WHERE user_id = auth.uid())
  OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

-- 5. Adicionar coluna inventory_item_id na tabela stock_movements (opcional, para rastrear variação)
ALTER TABLE public.stock_movements 
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL;

-- 6. Adicionar coluna notes na tabela stock_movements
ALTER TABLE public.stock_movements 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 7. Adicionar colunas previous_stock e new_stock para histórico
ALTER TABLE public.stock_movements 
ADD COLUMN IF NOT EXISTS previous_stock INTEGER;

ALTER TABLE public.stock_movements 
ADD COLUMN IF NOT EXISTS new_stock INTEGER;

-- 8. Adicionar coluna variations em products (JSON com tamanhos/cores disponíveis)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '{"sizes": [], "colors": []}';

-- 9. Trigger para atualizar updated_at em inventory_items
CREATE OR REPLACE FUNCTION public.update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_updated_at();

-- 10. Migrar dados existentes: criar inventory_items a partir de products com quantidade
INSERT INTO public.inventory_items (product_id, team_id, size, color, quantity, min_stock, location)
SELECT 
  id as product_id,
  team_id,
  COALESCE(size, 'Único') as size,
  COALESCE(color, 'Padrão') as color,
  quantity,
  min_stock,
  'Principal' as location
FROM public.products
WHERE quantity > 0 OR min_stock > 0
ON CONFLICT (product_id, size, color, location) DO NOTHING;