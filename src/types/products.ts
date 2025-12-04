export type ProductStatus = 'ativo' | 'inativo' | 'descontinuado';
export type StockStatus = 'critico' | 'baixo' | 'medio' | 'alto';

export interface VariableCost {
  id: string;
  name: string;
  value: number;
}

export interface PriceHistory {
  date: string;
  price: number;
  reason?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  imageUrl?: string;
  status: ProductStatus;
  
  // Pricing
  variableCosts: VariableCost[];
  fixedCostAllocation: number; // percentage
  customMargin?: number;
  salePrice: number;
  costPrice: number;
  priceHistory: PriceHistory[];
  
  // Stock
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location?: string;
  
  // Production
  productionTime?: number;
  dailyCapacity?: number;
  leadTime?: number;
  
  // Sales
  monthlySalesAvg?: number;
  seasonality?: string[];
  salesChannel?: string;
  
  // Metadata
  size?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  description: string;
  status: ProductStatus;
  variableCosts: VariableCost[];
  fixedCostAllocation: number;
  customMargin: number;
  salePrice: string;
  costPrice: string;
  quantity: string;
  minStock: string;
  maxStock: string;
  unit: string;
  location: string;
  size: string;
  color: string;
  productionTime: string;
  dailyCapacity: string;
  leadTime: string;
  monthlySalesAvg: string;
  seasonality: string[];
  salesChannel: string;
}

export const defaultCategories = [
  "Camisetas", "Calças", "Vestidos", "Shorts", "Saias", 
  "Moletons", "Acessórios", "Bolsas", "Calçados", "Outros"
];

export const defaultSizes = ["PP", "P", "M", "G", "GG", "XG", "Único"];
export const defaultColors = ["Preto", "Branco", "Azul", "Vermelho", "Verde", "Amarelo", "Rosa", "Cinza", "Bege", "Marrom"];
export const defaultUnits = ["un", "kg", "g", "l", "ml", "m", "cm", "par", "cx", "pct"];
export const defaultSeasonality = ["Verão", "Inverno", "Natal", "Páscoa", "Dia das Mães", "Black Friday"];
export const defaultSalesChannels = ["Loja Física", "E-commerce", "Atacado", "Marketplace", "Redes Sociais"];

export const emptyFormData: ProductFormData = {
  name: "",
  sku: "",
  category: "",
  description: "",
  status: "ativo",
  variableCosts: [],
  fixedCostAllocation: 100,
  customMargin: 30,
  salePrice: "",
  costPrice: "",
  quantity: "",
  minStock: "10",
  maxStock: "200",
  unit: "un",
  location: "",
  size: "",
  color: "",
  productionTime: "",
  dailyCapacity: "",
  leadTime: "",
  monthlySalesAvg: "",
  seasonality: [],
  salesChannel: "",
};
