import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductFormData, StockStatus } from '@/types/products';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DbProduct {
  id: string;
  team_id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  status: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  min_stock: number;
  unit: string;
  size: string | null;
  color: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    sku: db.sku,
    category: db.category,
    description: db.description || undefined,
    imageUrl: db.image_url || undefined,
    status: db.status as Product['status'],
    variableCosts: [],
    fixedCostAllocation: 100,
    customMargin: undefined,
    salePrice: db.sale_price,
    costPrice: db.cost_price,
    priceHistory: [],
    quantity: db.quantity,
    minStock: db.min_stock,
    maxStock: 200,
    unit: db.unit,
    location: undefined,
    size: db.size || undefined,
    color: db.color || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function useProducts() {
  const { profile, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const teamId = profile?.current_team_id;

  const fetchProducts = useCallback(async () => {
    if (!teamId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts((data as DbProduct[]).map(mapDbToProduct));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const generateSKU = useCallback((category: string) => {
    const prefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }, []);

  const addProduct = useCallback(async (formData: ProductFormData): Promise<Product | null> => {
    if (!teamId) return null;

    const costPrice = parseFloat(formData.costPrice) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;
    const sku = formData.sku || generateSKU(formData.category);

    const { data, error } = await supabase
      .from('products')
      .insert({
        team_id: teamId,
        name: formData.name,
        sku,
        category: formData.category,
        description: formData.description || null,
        status: formData.status,
        cost_price: costPrice,
        sale_price: salePrice,
        quantity: parseInt(formData.quantity) || 0,
        min_stock: parseInt(formData.minStock) || 10,
        unit: formData.unit || 'un',
        size: formData.size || null,
        color: formData.color || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    const newProduct = mapDbToProduct(data as DbProduct);
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, [teamId, generateSKU]);

  const updateProduct = useCallback(async (id: string, formData: Partial<ProductFormData>): Promise<Product | null> => {
    const updates: Record<string, unknown> = {};
    
    if (formData.name !== undefined) updates.name = formData.name;
    if (formData.sku !== undefined) updates.sku = formData.sku;
    if (formData.category !== undefined) updates.category = formData.category;
    if (formData.description !== undefined) updates.description = formData.description || null;
    if (formData.status !== undefined) updates.status = formData.status;
    if (formData.costPrice !== undefined) updates.cost_price = parseFloat(formData.costPrice) || 0;
    if (formData.salePrice !== undefined) updates.sale_price = parseFloat(formData.salePrice) || 0;
    if (formData.quantity !== undefined) updates.quantity = parseInt(formData.quantity) || 0;
    if (formData.minStock !== undefined) updates.min_stock = parseInt(formData.minStock) || 10;
    if (formData.unit !== undefined) updates.unit = formData.unit;
    if (formData.size !== undefined) updates.size = formData.size || null;
    if (formData.color !== undefined) updates.color = formData.color || null;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    const updatedProduct = mapDbToProduct(data as DbProduct);
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    return updatedProduct;
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    return true;
  }, []);

  const duplicateProduct = useCallback(async (id: string): Promise<Product | null> => {
    const product = products.find(p => p.id === id);
    if (!product || !teamId) return null;

    const { data, error } = await supabase
      .from('products')
      .insert({
        team_id: teamId,
        name: `${product.name} (Cópia)`,
        sku: generateSKU(product.category),
        category: product.category,
        description: product.description || null,
        status: product.status,
        cost_price: product.costPrice,
        sale_price: product.salePrice,
        quantity: product.quantity,
        min_stock: product.minStock,
        unit: product.unit,
        size: product.size || null,
        color: product.color || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating product:', error);
      return null;
    }

    const newProduct = mapDbToProduct(data as DbProduct);
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, [products, teamId, generateSKU]);

  const updateStock = useCallback(async (id: string, quantity: number, type: 'entrada' | 'saida', reason: string): Promise<boolean> => {
    const product = products.find(p => p.id === id);
    if (!product || !teamId || !user) return false;

    const newQuantity = type === 'entrada' 
      ? product.quantity + quantity 
      : product.quantity - quantity;

    if (newQuantity < 0) return false;

    // Update product quantity
    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating stock:', updateError);
      return false;
    }

    // Log stock movement
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: id,
        team_id: teamId,
        user_id: user.id,
        type,
        quantity,
        reason,
      });

    if (movementError) {
      console.error('Error logging stock movement:', movementError);
    }

    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, quantity: newQuantity, updatedAt: new Date().toISOString() } : p
    ));
    
    return true;
  }, [products, teamId, user]);

  const getStockStatus = useCallback((product: Product): { status: StockStatus; label: string; color: string } => {
    const { quantity, minStock, maxStock } = product;
    
    if (quantity === 0) {
      return { status: 'critico', label: 'Sem estoque', color: 'text-danger' };
    }
    if (quantity <= minStock * 0.5) {
      return { status: 'critico', label: 'Crítico', color: 'text-danger' };
    }
    if (quantity <= minStock) {
      return { status: 'baixo', label: 'Estoque baixo', color: 'text-warning' };
    }
    if (quantity >= maxStock * 0.8) {
      return { status: 'alto', label: 'Estoque alto', color: 'text-success' };
    }
    return { status: 'medio', label: 'Normal', color: 'text-info' };
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.status === 'ativo');
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.salePrice), 0);
    const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const lowStockProducts = products.filter(p => p.quantity <= p.minStock && p.quantity > 0);
    const outOfStockProducts = products.filter(p => p.quantity === 0);
    const profitableProducts = products.filter(p => p.salePrice > p.costPrice);

    return {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      totalStock,
      totalValue,
      totalCost,
      potentialProfit: totalValue - totalCost,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      outOfStockProducts,
      profitableProducts: profitableProducts.length,
    };
  }, [products]);

  return {
    products,
    isLoading,
    stats,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    updateStock,
    getStockStatus,
    generateSKU,
    refetch: fetchProducts,
  };
}
