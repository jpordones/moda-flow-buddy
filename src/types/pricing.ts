// =============================================================================
// TIPOS DO SISTEMA DE PRECIFICAÇÃO PROFISSIONAL LAMAR PRO
// =============================================================================

export type TaxRegime = 'simples' | 'presumido' | 'real';
export type MarketplaceType = 'none' | 'shopee' | 'mercadolivre' | 'amazon' | 'magalu' | 'custom';

// 1. CUSTOS DO PRODUTO (por unidade)
export interface ProductCosts {
  fabric: number;           // Tecido/Material principal
  accessories: number;      // Botões, zíperes, aviamentos
  packaging: number;        // Embalagem individual (saquinho, tag)
  laborCost: number;        // Custo de confecção/mão de obra por peça
  qualityControl: number;   // Controle de qualidade por peça
  photography: number;      // Custo de foto amortizado (se aplicável)
  other: number;            // Outros custos diretos
}

// 2. CUSTOS FIXOS MENSAIS (a diluir)
export interface FixedMonthlyCosts {
  // Infraestrutura
  rent: number;             // Aluguel
  utilities: number;        // Energia, água, gás
  internet: number;         // Internet/telefone
  
  // Pessoal
  salaries: number;         // Salários totais
  benefits: number;         // Benefícios (vale transporte, etc)
  
  // Operação
  software: number;         // FEDCOM, ERP, etc
  accounting: number;       // Contador
  insurance: number;        // Seguros
  maintenance: number;      // Manutenção equipamentos
  other: number;            // Outros custos fixos
}

// 3. CUSTOS VARIÁVEIS DE VENDA (%)
export interface VariableSalesCosts {
  // Marketplace (se aplicável)
  marketplaceType: MarketplaceType;
  marketplaceFee: number;         // Taxa marketplace (% sobre venda)
  marketplaceShipping: number;    // Taxa frete marketplace (R$)
  
  // Pagamento
  paymentGateway: number;         // Taxa gateway (%)
  
  // Logística
  shippingCost: number;           // Custo frete (R$ - se grátis para cliente)
  shippingPackaging: number;      // Embalagem envio (R$)
  reverseLogistics: number;       // Custo devoluções (%)
  
  // Marketing
  adsCost: number;                // % da venda em anúncios
  affiliateCommission: number;    // Comissão afiliados (%)
}

// 4. CONFIGURAÇÕES DE IMPOSTOS
export interface TaxSettings {
  taxRegime: TaxRegime;
  
  // Simples Nacional
  simplesRate: number;            // 6% a 15.5% conforme faturamento
  
  // Lucro Presumido/Real
  icms: number;                   // ICMS (varia por estado)
  pis: number;                    // PIS (0.65% ou 1.65%)
  cofins: number;                 // COFINS (3% ou 7.6%)
}

// 5. CONFIGURAÇÕES DE PRECIFICAÇÃO
export interface PricingConfig {
  monthlyVolume: number;          // Volume de produção/vendas mensal
  desiredMargin: number;          // Margem de lucro desejada (%)
  minimumMargin: number;          // Margem mínima aceitável (%)
  marketPrice: number;            // Preço praticado no mercado (opcional)
  competitorPrice: number;        // Preço do concorrente (opcional)
}

// DADOS COMPLETOS DE PRECIFICAÇÃO
export interface PricingData {
  productCosts: ProductCosts;
  fixedCosts: FixedMonthlyCosts;
  variableCosts: VariableSalesCosts;
  taxes: TaxSettings;
  config: PricingConfig;
}

// BREAKDOWN DETALHADO DOS CUSTOS
export interface CostBreakdown {
  productCost: number;
  fixedCostsPerUnit: number;
  variableFixedCosts: number;  // Custos variáveis em R$
  feesAmount: number;          // Taxas em R$
  taxesAmount: number;         // Impostos em R$
  profitAmount: number;        // Lucro em R$
}

// RESULTADO DOS CÁLCULOS
export interface PricingResult {
  // Viabilidade
  viable: boolean;
  error?: string;
  
  // Preços
  calculatedPrice: number;
  suggestedPrice: number;       // Preço psicológico (X,99)
  minimumPrice: number;         // Preço break-even
  premiumPrice: number;         // Preço premium
  
  // Custos detalhados
  directCost: number;
  fixedCostPerUnit: number;
  totalCostBeforeSale: number;
  variableFixedCosts: number;   // Custos variáveis em R$
  
  // Percentuais
  variableFeesPercent: number;
  taxPercent: number;
  
  // Margens
  grossProfit: number;
  netProfit: number;
  netMargin: number;
  
  // Comparação com mercado
  competitiveness: number | null;
  
  // Breakdown para gráfico
  breakdown: CostBreakdown;
  
  // Totais mensais
  totalFixedCostsMonthly: number;
}

// CENÁRIO DE ANÁLISE
export interface PricingScenario {
  name: string;
  emoji: string;
  volumeMultiplier: number;
  volume: number;
  fixedCostPerUnit: number;
  price: number;
  profit: number;
  margin: number;
}

// ALERTA INTELIGENTE
export interface PricingAlert {
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
}

// VALORES PADRÃO
export const defaultProductCosts: ProductCosts = {
  fabric: 20,
  accessories: 5,
  packaging: 2,
  laborCost: 15,
  qualityControl: 0,
  photography: 0,
  other: 0,
};

export const defaultFixedCosts: FixedMonthlyCosts = {
  rent: 0,
  utilities: 150,
  internet: 100,
  salaries: 0,
  benefits: 0,
  software: 100,
  accounting: 300,
  insurance: 0,
  maintenance: 0,
  other: 0,
};

export const defaultVariableCosts: VariableSalesCosts = {
  marketplaceType: 'none',
  marketplaceFee: 0,
  marketplaceShipping: 0,
  paymentGateway: 3.5,
  shippingCost: 15,
  shippingPackaging: 5,
  reverseLogistics: 3,
  adsCost: 10,
  affiliateCommission: 0,
};

export const defaultTaxSettings: TaxSettings = {
  taxRegime: 'simples',
  simplesRate: 6,
  icms: 18,
  pis: 1.65,
  cofins: 7.6,
};

export const defaultPricingConfig: PricingConfig = {
  monthlyVolume: 100,
  desiredMargin: 30,
  minimumMargin: 15,
  marketPrice: 0,
  competitorPrice: 0,
};

export const defaultPricingData: PricingData = {
  productCosts: defaultProductCosts,
  fixedCosts: defaultFixedCosts,
  variableCosts: defaultVariableCosts,
  taxes: defaultTaxSettings,
  config: defaultPricingConfig,
};

// PRESETS DE MARKETPLACE
export const marketplacePresets: Record<MarketplaceType, { name: string; fee: number }> = {
  none: { name: 'Loja Própria', fee: 0 },
  shopee: { name: 'Shopee', fee: 12 },
  mercadolivre: { name: 'Mercado Livre', fee: 16 },
  amazon: { name: 'Amazon', fee: 15 },
  magalu: { name: 'Magazine Luiza', fee: 14 },
  custom: { name: 'Outro', fee: 0 },
};
