import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductFormData, StockStatus, StockMovement } from '@/types/products';

const PRODUCTS_STORAGE_KEY = 'fedcom-products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProducts = useCallback((newProducts: Product[]) => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }, []);

  const generateSKU = useCallback((category: string) => {
    const prefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }, []);

  const addProduct = useCallback((formData: ProductFormData): Product => {
    const now = new Date().toISOString();
    const costPrice = parseFloat(formData.costPrice) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;
    
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: formData.name,
      sku: formData.sku || generateSKU(formData.category),
      category: formData.category,
      description: formData.description,
      status: formData.status,
      variableCosts: formData.variableCosts,
      fixedCostAllocation: formData.fixedCostAllocation,
      customMargin: formData.customMargin,
      salePrice,
      costPrice,
      priceHistory: [{ date: now, price: salePrice, reason: 'Cadastro inicial' }],
      quantity: parseInt(formData.quantity) || 0,
      minStock: parseInt(formData.minStock) || 10,
      maxStock: parseInt(formData.maxStock) || 200,
      unit: formData.unit,
      location: formData.location,
      productionTime: formData.productionTime ? parseInt(formData.productionTime) : undefined,
      dailyCapacity: formData.dailyCapacity ? parseInt(formData.dailyCapacity) : undefined,
      leadTime: formData.leadTime ? parseInt(formData.leadTime) : undefined,
      monthlySalesAvg: formData.monthlySalesAvg ? parseFloat(formData.monthlySalesAvg) : undefined,
      seasonality: formData.seasonality,
      salesChannel: formData.salesChannel,
      size: formData.size,
      color: formData.color,
      createdAt: now,
      updatedAt: now,
    };

    saveProducts([...products, newProduct]);
    return newProduct;
  }, [products, saveProducts, generateSKU]);

  const updateProduct = useCallback((id: string, formData: Partial<ProductFormData>): Product | null => {
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) return null;

    const existingProduct = products[productIndex];
    const now = new Date().toISOString();
    
    const newSalePrice = formData.salePrice !== undefined 
      ? parseFloat(formData.salePrice) 
      : existingProduct.salePrice;
    
    const priceHistory = [...existingProduct.priceHistory];
    if (newSalePrice !== existingProduct.salePrice) {
      priceHistory.push({ date: now, price: newSalePrice, reason: 'Atualização de preço' });
    }

    const updatedProduct: Product = {
      ...existingProduct,
      name: formData.name ?? existingProduct.name,
      sku: formData.sku ?? existingProduct.sku,
      category: formData.category ?? existingProduct.category,
      description: formData.description ?? existingProduct.description,
      status: formData.status ?? existingProduct.status,
      variableCosts: formData.variableCosts ?? existingProduct.variableCosts,
      fixedCostAllocation: formData.fixedCostAllocation ?? existingProduct.fixedCostAllocation,
      customMargin: formData.customMargin ?? existingProduct.customMargin,
      salePrice: newSalePrice,
      costPrice: formData.costPrice !== undefined ? parseFloat(formData.costPrice) : existingProduct.costPrice,
      priceHistory,
      quantity: formData.quantity !== undefined ? parseInt(formData.quantity) : existingProduct.quantity,
      minStock: formData.minStock !== undefined ? parseInt(formData.minStock) : existingProduct.minStock,
      maxStock: formData.maxStock !== undefined ? parseInt(formData.maxStock) : existingProduct.maxStock,
      unit: formData.unit ?? existingProduct.unit,
      location: formData.location ?? existingProduct.location,
      size: formData.size ?? existingProduct.size,
      color: formData.color ?? existingProduct.color,
      updatedAt: now,
    };

    const newProducts = [...products];
    newProducts[productIndex] = updatedProduct;
    saveProducts(newProducts);
    return updatedProduct;
  }, [products, saveProducts]);

  const deleteProduct = useCallback((id: string) => {
    saveProducts(products.filter(p => p.id !== id));
  }, [products, saveProducts]);

  const duplicateProduct = useCallback((id: string): Product | null => {
    const product = products.find(p => p.id === id);
    if (!product) return null;

    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Cópia)`,
      sku: generateSKU(product.category),
      priceHistory: [{ date: now, price: product.salePrice, reason: 'Duplicado' }],
      createdAt: now,
      updatedAt: now,
    };

    saveProducts([...products, newProduct]);
    return newProduct;
  }, [products, saveProducts, generateSKU]);

  const updateStock = useCallback((id: string, quantity: number, type: 'entrada' | 'saida', reason: string) => {
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) return false;

    const product = products[productIndex];
    const newQuantity = type === 'entrada' 
      ? product.quantity + quantity 
      : product.quantity - quantity;

    if (newQuantity < 0) return false;

    const newProducts = [...products];
    newProducts[productIndex] = {
      ...product,
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
    };
    saveProducts(newProducts);
    return true;
  }, [products, saveProducts]);

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
  };
}
