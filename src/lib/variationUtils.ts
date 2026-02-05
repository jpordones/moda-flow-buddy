 // Utility functions for variation normalization and consistency
 // Ensures Products and Inventory use the same variation names
 
 /**
  * Normalize variation text: trim, capitalize first letter of each word
  * Example: "  preta  " → "Preta", "AZUL MARINHO" → "Azul Marinho"
  */
 export function normalizeVariationValue(value: string | null | undefined): string {
   if (!value || value.trim() === '') return '';
   
   return value
     .trim()
     .toLowerCase()
     .split(' ')
     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
     .join(' ');
 }
 
 /**
  * Normalize all values in a variant options object
  */
 export function normalizeVariantOptions(options: Record<string, string>): Record<string, string> {
   const normalized: Record<string, string> = {};
   
   for (const [key, value] of Object.entries(options)) {
     if (value && value.trim()) {
       normalized[key] = normalizeVariationValue(value);
     }
   }
   
   return normalized;
 }
 
 /**
  * Normalize an array of variation values
  */
 export function normalizeVariationArray(values: string[]): string[] {
   return values
     .map(v => normalizeVariationValue(v))
     .filter(v => v !== '')
     // Remove duplicates after normalization
     .filter((v, i, arr) => arr.indexOf(v) === i);
 }
 
 /**
  * Compare two variation option objects for equality
  */
 export function variantOptionsEqual(
   a: Record<string, string>, 
   b: Record<string, string>
 ): boolean {
   const normalizedA = normalizeVariantOptions(a);
   const normalizedB = normalizeVariantOptions(b);
   
   const keysA = Object.keys(normalizedA).sort();
   const keysB = Object.keys(normalizedB).sort();
   
   if (keysA.length !== keysB.length) return false;
   
   return keysA.every((key, i) => 
     key === keysB[i] && normalizedA[key] === normalizedB[key]
   );
 }
 
 /**
  * Build a unique key for a variation combination
  * Useful for deduplication and lookups
  */
 export function getVariantKey(options: Record<string, string>): string {
   const normalized = normalizeVariantOptions(options);
   return Object.entries(normalized)
     .sort(([a], [b]) => a.localeCompare(b))
     .map(([key, value]) => `${key}:${value}`)
     .join('|');
 }
 
 /**
  * Check if a variation exists in a product's available options
  * Used to validate order items against product catalog
  */
 export interface ProductVariations {
   colors?: string[];
   sizes?: string[];
   prints?: string[];
 }
 
 export function isValidVariation(
   product: ProductVariations,
   color?: string | null,
   size?: string | null,
   print?: string | null
 ): { valid: boolean; errors: string[] } {
   const errors: string[] = [];
   
   // Normalize input values
   const normColor = normalizeVariationValue(color);
   const normSize = normalizeVariationValue(size);
   const normPrint = normalizeVariationValue(print);
   
   // Normalize product arrays
   const normColors = normalizeVariationArray(product.colors || []);
   const normSizes = normalizeVariationArray(product.sizes || []);
   const normPrints = normalizeVariationArray(product.prints || []);
   
   // If color is specified, check if it's valid
   if (normColor && normColors.length > 0 && !normColors.includes(normColor)) {
     errors.push(`Cor "${normColor}" não disponível para este produto`);
   }
   
   // If size is specified, check if it's valid
   if (normSize && normSizes.length > 0 && !normSizes.includes(normSize)) {
     errors.push(`Tamanho "${normSize}" não disponível para este produto`);
   }
   
   // If print is specified, check if it's valid
   if (normPrint && normPrints.length > 0 && !normPrints.includes(normPrint)) {
     errors.push(`Estampa "${normPrint}" não disponível para este produto`);
   }
   
   return {
     valid: errors.length === 0,
     errors,
   };
 }
 
 /**
  * Get display name for a variation combination
  */
 export function getVariationDisplayName(
   color?: string | null,
   size?: string | null,
   print?: string | null
 ): string {
   const parts: string[] = [];
   
   if (color && color !== 'Padrão') parts.push(normalizeVariationValue(color));
   if (size && size !== 'Único') parts.push(normalizeVariationValue(size));
   if (print) parts.push(normalizeVariationValue(print));
   
   return parts.length > 0 ? parts.join(' / ') : 'Sem variação';
 }