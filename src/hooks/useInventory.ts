import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  InventoryItem, 
  StockMovement, 
  ProductWithInventory, 
  StockEntryData, 
  StockExitData,
  InventoryStats 
} from '@/types/inventory';
import { VariantOptions, legacyToVariantOptions } from '@/types/productEditor';

interface DbInventoryItem {
  id: string;
  product_id: string;
  team_id: string;
  size: string | null;
  color: string | null;
  variant_options: Record<string, string> | null;
  quantity: number;
  min_stock: number;
  critical_stock: number;
  location: string | null;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    sku: string;
    sale_price: number;
    cost_price: number;
    category: string;
    status: string;
  } | null;
}

interface DbStockMovement {
  id: string;
  inventory_item_id: string | null;
  product_id: string;
  team_id: string;
  user_id: string;
  type: string;
  quantity: number;
  reason: string | null;
  notes: string | null;
  previous_stock: number | null;
  new_stock: number | null;
  created_at: string;
  products?: {
    name: string;
    sku: string;
  } | null;
}

function mapDbToInventoryItem(db: DbInventoryItem): InventoryItem {
  // Build variant_options: prefer JSONB, fallback to legacy size/color
  let variantOptions: VariantOptions = {};
  
  if (db.variant_options && Object.keys(db.variant_options).length > 0) {
    variantOptions = db.variant_options;
  } else {
    // Backward compatibility: build from legacy fields
    variantOptions = legacyToVariantOptions(db.size, db.color);
  }

  return {
    id: db.id,
    productId: db.product_id,
    teamId: db.team_id,
    size: db.size || 'Único',
    color: db.color || 'Padrão',
    variantOptions,
    quantity: db.quantity,
    minStock: db.min_stock,
    criticalStock: db.critical_stock,
    location: db.location || 'Principal',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    product: db.products ? {
      id: db.products.id,
      name: db.products.name,
      sku: db.products.sku,
      salePrice: db.products.sale_price,
      costPrice: db.products.cost_price,
      category: db.products.category,
      status: db.products.status,
    } : undefined,
  };
}

function mapDbToMovement(db: DbStockMovement): StockMovement {
  return {
    id: db.id,
    inventoryItemId: db.inventory_item_id,
    productId: db.product_id,
    teamId: db.team_id,
    userId: db.user_id,
    type: db.type as 'entrada' | 'saida',
    quantity: db.quantity,
    reason: db.reason || '',
    notes: db.notes,
    previousStock: db.previous_stock,
    newStock: db.new_stock,
    createdAt: db.created_at,
    product: db.products ? {
      name: db.products.name,
      sku: db.products.sku,
    } : undefined,
  };
}

export function useInventory() {
  const { profile, user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const teamId = profile?.current_team_id;

  const fetchInventory = useCallback(async () => {
    if (!teamId) {
      setInventoryItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          products (id, name, sku, sale_price, cost_price, category, status)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory:', error);
        setInventoryItems([]);
      } else {
        setInventoryItems((data as unknown as DbInventoryItem[]).map(mapDbToInventoryItem));
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventoryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  const fetchMovements = useCallback(async (productId?: string, limit = 50) => {
    if (!teamId) return;

    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          products (name, sku)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching movements:', error);
      } else {
        setMovements((data as unknown as DbStockMovement[]).map(mapDbToMovement));
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  }, [teamId]);

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, [fetchInventory, fetchMovements]);

  // Group inventory items by product
  const productsWithInventory = useMemo((): ProductWithInventory[] => {
    const productMap = new Map<string, ProductWithInventory>();

    inventoryItems.forEach(item => {
      if (!item.product) return;

      const existing = productMap.get(item.productId);
      if (existing) {
        existing.inventoryItems.push(item);
        existing.totalStock += item.quantity;
        existing.totalValue += item.quantity * item.product.salePrice;
      } else {
        productMap.set(item.productId, {
          id: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          category: item.product.category,
          status: item.product.status,
          salePrice: item.product.salePrice,
          costPrice: item.product.costPrice,
          totalStock: item.quantity,
          totalValue: item.quantity * item.product.salePrice,
          inventoryItems: [item],
          stockStatus: 'normal',
        });
      }
    });

    // Calculate stock status for each product
    productMap.forEach(product => {
      const hasOutOfStock = product.inventoryItems.some(i => i.quantity === 0);
      const hasCritical = product.inventoryItems.some(i => i.quantity > 0 && i.quantity <= i.criticalStock);
      const hasLow = product.inventoryItems.some(i => i.quantity > i.criticalStock && i.quantity <= i.minStock);

      if (hasOutOfStock || hasCritical) {
        product.stockStatus = 'critico';
      } else if (hasLow) {
        product.stockStatus = 'baixo';
      } else if (product.totalStock > 50) {
        product.stockStatus = 'alto';
      } else {
        product.stockStatus = 'normal';
      }
    });

    return Array.from(productMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [inventoryItems]);

  // Stats
  const stats = useMemo((): InventoryStats => {
    const totalItems = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = inventoryItems.reduce((sum, i) => sum + (i.quantity * (i.product?.salePrice || 0)), 0);
    const outOfStockCount = inventoryItems.filter(i => i.quantity === 0).length;
    const criticalStockCount = inventoryItems.filter(i => i.quantity > 0 && i.quantity <= i.criticalStock).length;
    const lowStockCount = inventoryItems.filter(i => i.quantity > i.criticalStock && i.quantity <= i.minStock).length;

    return {
      totalItems,
      totalValue,
      totalProducts: productsWithInventory.length,
      lowStockCount,
      outOfStockCount,
      criticalStockCount,
    };
  }, [inventoryItems, productsWithInventory]);

  // Add stock entry
  const addStockEntry = useCallback(async (data: StockEntryData): Promise<boolean> => {
    if (!teamId || !user) return false;

    try {
      // Find or create inventory item
      let inventoryItem = inventoryItems.find(
        i => i.productId === data.productId && i.size === data.size && i.color === data.color
      );

      const previousStock = inventoryItem?.quantity || 0;
      const newStock = previousStock + data.quantity;

      if (inventoryItem) {
        // Update existing
        const { error } = await supabase
          .from('inventory_items')
          .update({ quantity: newStock })
          .eq('id', inventoryItem.id);

        if (error) throw error;
      } else {
        // Create new
        const { data: newItem, error } = await supabase
          .from('inventory_items')
          .insert({
            product_id: data.productId,
            team_id: teamId,
            size: data.size,
            color: data.color,
            quantity: data.quantity,
            min_stock: 5,
            critical_stock: 2,
          })
          .select()
          .single();

        if (error) throw error;
        inventoryItem = mapDbToInventoryItem(newItem as unknown as DbInventoryItem);
      }

      // Log movement
      await supabase
        .from('stock_movements')
        .insert({
          product_id: data.productId,
          inventory_item_id: inventoryItem?.id || null,
          team_id: teamId,
          user_id: user.id,
          type: 'entrada',
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes || null,
          previous_stock: previousStock,
          new_stock: newStock,
        });

      // Update product quantity (legacy support)
      // Update product quantity directly
      const totalStock = inventoryItems
        .filter(i => i.productId === data.productId && i.id !== inventoryItem?.id)
        .reduce((sum, i) => sum + i.quantity, 0) + newStock;
      
      await supabase
        .from('products')
        .update({ quantity: totalStock })
        .eq('id', data.productId);

      await fetchInventory();
      await fetchMovements();
      return true;
    } catch (error) {
      console.error('Error adding stock entry:', error);
      return false;
    }
  }, [teamId, user, inventoryItems, fetchInventory, fetchMovements]);

  // Add stock exit
  const addStockExit = useCallback(async (data: StockExitData): Promise<boolean> => {
    if (!teamId || !user) return false;

    try {
      const inventoryItem = inventoryItems.find(
        i => i.productId === data.productId && i.size === data.size && i.color === data.color
      );

      if (!inventoryItem) {
        console.error('Inventory item not found');
        return false;
      }

      const previousStock = inventoryItem.quantity;
      const newStock = previousStock - data.quantity;

      if (newStock < 0) {
        console.error('Insufficient stock');
        return false;
      }

      // Update inventory
      const { error } = await supabase
        .from('inventory_items')
        .update({ quantity: newStock })
        .eq('id', inventoryItem.id);

      if (error) throw error;

      // Log movement
      await supabase
        .from('stock_movements')
        .insert({
          product_id: data.productId,
          inventory_item_id: inventoryItem.id,
          team_id: teamId,
          user_id: user.id,
          type: 'saida',
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes || null,
          previous_stock: previousStock,
          new_stock: newStock,
        });

      // Update product quantity
      const totalStock = inventoryItems
        .filter(i => i.productId === data.productId && i.id !== inventoryItem.id)
        .reduce((sum, i) => sum + i.quantity, 0) + newStock;

      await supabase
        .from('products')
        .update({ quantity: totalStock })
        .eq('id', data.productId);

      await fetchInventory();
      await fetchMovements();
      return true;
    } catch (error) {
      console.error('Error adding stock exit:', error);
      return false;
    }
  }, [teamId, user, inventoryItems, fetchInventory, fetchMovements]);

  // Update min/critical stock for item
  const updateStockAlerts = useCallback(async (
    itemId: string, 
    minStock: number, 
    criticalStock: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ min_stock: minStock, critical_stock: criticalStock })
        .eq('id', itemId);

      if (error) throw error;
      await fetchInventory();
      return true;
    } catch (error) {
      console.error('Error updating stock alerts:', error);
      return false;
    }
  }, [fetchInventory]);

  // Get stock status for an item
  const getItemStockStatus = useCallback((item: InventoryItem): { status: string; label: string; variant: string } => {
    if (item.quantity === 0) {
      return { status: 'critico', label: 'Sem estoque', variant: 'danger' };
    }
    if (item.quantity <= item.criticalStock) {
      return { status: 'critico', label: 'Crítico', variant: 'danger' };
    }
    if (item.quantity <= item.minStock) {
      return { status: 'baixo', label: 'Baixo', variant: 'warning' };
    }
    return { status: 'normal', label: 'Normal', variant: 'success' };
  }, []);

  return {
    inventoryItems,
    movements,
    productsWithInventory,
    stats,
    isLoading,
    addStockEntry,
    addStockExit,
    updateStockAlerts,
    getItemStockStatus,
    fetchInventory,
    fetchMovements,
  };
}
