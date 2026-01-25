// Types for the Nuvemshop-style product editor
// Supports N-attribute variations via variant_options JSONB

export interface VariantProperty {
  id: string;
  name: string; // e.g., "Cor", "Tamanho", "Estampa"
  values: string[]; // e.g., ["Preto", "Branco"]
}

// variant_options is a flexible JSONB structure: { "Cor": "Preto", "Tamanho": "M", "Estampa": "Logo X" }
export type VariantOptions = Record<string, string>;

export interface ProductVariant {
  id: string;
  properties: VariantOptions; // Flexible N-attribute variations
  sku: string;
  barcode: string;
  price: number | null; // null means use base product price
  quantity: number;
  inventoryItemId?: string; // For existing variants
}

export interface ProductEditorData {
  // Basic info
  name: string;
  description: string;
  
  // Pricing
  costPrice: number;
  salePrice: number;
  
  // Inventory
  hasVariations: boolean;
  isInfiniteStock: boolean;
  quantity: number; // Used when no variations
  
  // Codes
  sku: string;
  barcode: string;
  
  // Variations
  variantProperties: VariantProperty[];
  variants: ProductVariant[];
  
  // Other
  category: string;
  status: 'ativo' | 'inativo' | 'descontinuado';
  
  // Optional fields
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
}

export const defaultProductEditorData: ProductEditorData = {
  name: '',
  description: '',
  costPrice: 0,
  salePrice: 0,
  hasVariations: false,
  isInfiniteStock: false,
  quantity: 0,
  sku: '',
  barcode: '',
  variantProperties: [],
  variants: [],
  category: '',
  status: 'ativo',
  minStock: 5,
  maxStock: 200,
  unit: 'un',
  location: '',
};

// Default properties include Cor, Tamanho, and Estampa for 3-attribute support
export const defaultVariantProperties: VariantProperty[] = [
  { id: 'color', name: 'Cor', values: [] },
  { id: 'size', name: 'Tamanho', values: [] },
  { id: 'print', name: 'Estampa', values: [] },
];

export const suggestedColors = [
  'Preto', 'Branco', 'Azul', 'Vermelho', 'Verde', 
  'Amarelo', 'Rosa', 'Cinza', 'Bege', 'Marrom', 
  'Laranja', 'Roxo', 'Vinho', 'Azul Marinho', 'Verde Militar'
];

export const suggestedSizes = [
  'PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG',
  '34', '36', '38', '40', '42', '44', '46', '48',
  'Único'
];

export const suggestedPrints = [
  'Liso', 'Estampado', 'Listrado', 'Xadrez', 'Floral',
  'Geométrico', 'Animal Print', 'Tie-Dye', 'Bordado', 'Logo'
];

// Generate all combinations of variants
export function generateVariantCombinations(properties: VariantProperty[]): Record<string, string>[] {
  const activeProps = properties.filter(p => p.values.length > 0);
  
  if (activeProps.length === 0) return [];
  
  const combinations: Record<string, string>[] = [];
  
  function generate(index: number, current: Record<string, string>) {
    if (index === activeProps.length) {
      combinations.push({ ...current });
      return;
    }
    
    const prop = activeProps[index];
    for (const value of prop.values) {
      current[prop.name] = value;
      generate(index + 1, current);
    }
  }
  
  generate(0, {});
  return combinations;
}

// Create variant objects from combinations
export function createVariantsFromCombinations(
  combinations: Record<string, string>[],
  existingVariants: ProductVariant[],
  basePrice: number
): ProductVariant[] {
  return combinations.map((combo, index) => {
    // Check if variant already exists
    const existing = existingVariants.find(v => {
      return Object.entries(combo).every(([key, value]) => v.properties[key] === value);
    });
    
    if (existing) {
      return existing;
    }
    
    // Generate SKU suffix from properties
    const skuSuffix = Object.values(combo)
      .map(v => v.substring(0, 2).toUpperCase())
      .join('-');
    
    return {
      id: `var_${Date.now()}_${index}`,
      properties: combo,
      sku: skuSuffix,
      barcode: '',
      price: null,
      quantity: 0,
    };
  });
}

// Get variant display name from properties
export function getVariantDisplayName(variant: ProductVariant): string {
  return Object.entries(variant.properties)
    .map(([, value]) => value)
    .join(' / ');
}

// Get variant display name from variant_options JSONB
export function getVariantDisplayNameFromOptions(options: VariantOptions): string {
  return Object.values(options).filter(Boolean).join(' / ');
}

// Convert legacy size/color fields to variant_options
export function legacyToVariantOptions(size?: string | null, color?: string | null): VariantOptions {
  const options: VariantOptions = {};
  if (color && color !== 'Padrão') options['Cor'] = color;
  if (size && size !== 'Único') options['Tamanho'] = size;
  return options;
}

// Extract legacy size/color from variant_options for backward compatibility
export function variantOptionsToLegacy(options: VariantOptions): { size: string; color: string } {
  return {
    size: options['Tamanho'] || 'Único',
    color: options['Cor'] || 'Padrão',
  };
}
