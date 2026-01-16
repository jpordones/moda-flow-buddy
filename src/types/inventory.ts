export interface InventoryItem {
  id: string;
  productId: string;
  teamId: string;
  size: string;
  color: string;
  quantity: number;
  minStock: number;
  criticalStock: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  // Joined product data
  product?: {
    id: string;
    name: string;
    sku: string;
    salePrice: number;
    costPrice: number;
    category: string;
    status: string;
  };
}

export interface StockMovement {
  id: string;
  inventoryItemId: string | null;
  productId: string;
  teamId: string;
  userId: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  notes: string | null;
  previousStock: number | null;
  newStock: number | null;
  createdAt: string;
  // Joined data
  product?: {
    name: string;
    sku: string;
  };
  inventoryItem?: {
    size: string;
    color: string;
  };
}

export interface ProductWithInventory {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: string;
  salePrice: number;
  costPrice: number;
  totalStock: number;
  totalValue: number;
  inventoryItems: InventoryItem[];
  stockStatus: 'critico' | 'baixo' | 'normal' | 'alto';
}

export interface StockEntryData {
  productId: string;
  size: string;
  color: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockExitData extends StockEntryData {}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  criticalStockCount: number;
}

export const movementReasons = {
  entrada: [
    { value: 'compra', label: 'Compra de Fornecedor' },
    { value: 'producao', label: 'Produção Interna' },
    { value: 'devolucao', label: 'Devolução de Cliente' },
    { value: 'ajuste', label: 'Ajuste de Estoque' },
    { value: 'transferencia', label: 'Transferência' },
  ],
  saida: [
    { value: 'venda', label: 'Venda' },
    { value: 'perda', label: 'Perda/Avaria' },
    { value: 'devolucao', label: 'Devolução a Fornecedor' },
    { value: 'ajuste', label: 'Ajuste de Estoque' },
    { value: 'doacao', label: 'Doação' },
    { value: 'transferencia', label: 'Transferência' },
  ],
};
