-- Add variant-specific fields to inventory_items
ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS barcode text NULL,
ADD COLUMN IF NOT EXISTS variant_price numeric NULL,
ADD COLUMN IF NOT EXISTS variant_sku text NULL;

-- Add is_infinite_stock to products for "Estoque Infinito" option
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS has_variations boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_infinite_stock boolean DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON public.inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_size_color ON public.inventory_items(size, color);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON public.inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_variant_sku ON public.inventory_items(variant_sku) WHERE variant_sku IS NOT NULL;