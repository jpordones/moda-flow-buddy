 // Hook for validating inventory availability for orders
 import { useCallback } from 'react';
 import { useInventory } from './useInventory';
 import { normalizeVariationValue } from '@/lib/variationUtils';
 
 export interface StockValidationResult {
   valid: boolean;
   available: number;
   requested: number;
   isInfinite: boolean;
   message?: string;
   inventoryItemId?: string;
 }
 
 export interface VariationStockInfo {
   productId: string;
   productName: string;
   totalStock: number;
   isInfinite: boolean;
   variations: {
     id: string;
     size: string;
     color: string;
     quantity: number;
     isInfinite: boolean;
   }[];
 }
 
 export function useInventoryValidation() {
   const { inventoryItems, productsWithInventory } = useInventory();
 
   /**
    * Check if a specific variation has sufficient stock
    */
   const validateStock = useCallback((
     productId: string,
     size: string,
     color: string,
     requestedQuantity: number
   ): StockValidationResult => {
     // Normalize input
     const normSize = normalizeVariationValue(size) || 'Único';
     const normColor = normalizeVariationValue(color) || 'Padrão';
 
     // Find the inventory item
     const item = inventoryItems.find(i => {
       const itemSize = normalizeVariationValue(i.size) || 'Único';
       const itemColor = normalizeVariationValue(i.color) || 'Padrão';
       return i.productId === productId && itemSize === normSize && itemColor === normColor;
     });
 
     if (!item) {
       // Check if product exists but variation doesn't
       const productExists = productsWithInventory.some(p => p.id === productId);
       
       if (productExists) {
         return {
           valid: false,
           available: 0,
           requested: requestedQuantity,
           isInfinite: false,
           message: `Variação ${normColor} / ${normSize} não encontrada no inventário`,
         };
       }
       
       return {
         valid: false,
         available: 0,
         requested: requestedQuantity,
         isInfinite: false,
         message: 'Produto não encontrado no inventário',
       };
     }
 
     // Check for infinite stock (via product setting - would need to be passed or fetched)
     // For now, we consider quantity > 0 or explicitly marked
     const isInfinite = false; // Would need product.is_infinite_stock
 
     if (isInfinite) {
       return {
         valid: true,
         available: Infinity,
         requested: requestedQuantity,
         isInfinite: true,
         inventoryItemId: item.id,
       };
     }
 
     const hasStock = item.quantity >= requestedQuantity;
 
     return {
       valid: hasStock,
       available: item.quantity,
       requested: requestedQuantity,
       isInfinite: false,
       inventoryItemId: item.id,
       message: hasStock 
         ? undefined 
         : `Estoque insuficiente: disponível ${item.quantity}, solicitado ${requestedQuantity}`,
     };
   }, [inventoryItems, productsWithInventory]);
 
   /**
    * Get stock info for a product with all its variations
    */
   const getProductStockInfo = useCallback((productId: string): VariationStockInfo | null => {
     const product = productsWithInventory.find(p => p.id === productId);
     
     if (!product) return null;
 
     const variations = product.inventoryItems.map(item => ({
       id: item.id,
       size: item.size,
       color: item.color,
       quantity: item.quantity,
       isInfinite: false, // Would need is_infinite_stock from product
     }));
 
     return {
       productId: product.id,
       productName: product.name,
       totalStock: product.totalStock,
       isInfinite: false,
       variations,
     };
   }, [productsWithInventory]);
 
   /**
    * Get available variations for a product (for dropdown options)
    */
   const getAvailableVariations = useCallback((productId: string): {
     sizes: string[];
     colors: string[];
   } => {
     const items = inventoryItems.filter(i => i.productId === productId);
     
     const sizes = new Set<string>();
     const colors = new Set<string>();
 
     items.forEach(item => {
       if (item.size && item.size !== 'Único') sizes.add(item.size);
       if (item.color && item.color !== 'Padrão') colors.add(item.color);
     });
 
     return {
       sizes: sizes.size > 0 ? Array.from(sizes).sort() : ['Único'],
       colors: colors.size > 0 ? Array.from(colors).sort() : ['Padrão'],
     };
   }, [inventoryItems]);
 
   /**
    * Check stock for multiple items (e.g., order validation)
    */
   const validateOrderItems = useCallback((items: {
     productId: string;
     size: string;
     color: string;
     quantity: number;
   }[]): { valid: boolean; errors: string[] } => {
     const errors: string[] = [];
 
     items.forEach((item, index) => {
       const result = validateStock(item.productId, item.size, item.color, item.quantity);
       if (!result.valid && result.message) {
         errors.push(`Item ${index + 1}: ${result.message}`);
       }
     });
 
     return {
       valid: errors.length === 0,
       errors,
     };
   }, [validateStock]);
 
   return {
     validateStock,
     getProductStockInfo,
     getAvailableVariations,
     validateOrderItems,
   };
 }