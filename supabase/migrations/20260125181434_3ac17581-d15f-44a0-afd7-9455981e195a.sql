-- Add variant_options JSONB column to inventory_items for flexible N-attribute variations
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS variant_options jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_inventory_variant_options 
ON public.inventory_items USING gin (variant_options);

-- Backfill existing records: populate variant_options from size/color if empty
UPDATE public.inventory_items
SET variant_options = jsonb_build_object(
  'Tamanho', COALESCE(size, ''),
  'Cor', COALESCE(color, '')
)
WHERE variant_options = '{}'::jsonb 
  AND (size IS NOT NULL OR color IS NOT NULL);