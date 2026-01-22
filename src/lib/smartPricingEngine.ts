import { Product } from "@/types/products";

export type PricingObjective = "lucro" | "giro" | "queima";

export interface SmartPricingInputs {
  product: Product;
  objective: PricingObjective;

  // Opcional: se o lojista souber o preço de mercado/concorrente
  marketPrice?: number;

  // Defaults do MVP (você pode expor isso depois em Settings)
  defaultTargetMarginPct?: number; // ex: 30
  feesPct?: number; // ex: 0 (MVP) ou 8
  taxesPct?: number; // ex: 0 (MVP) ou 6
}

export interface PricingBreakdown {
  baseCost: number;
  feesPct: number;
  taxesPct: number;
  targetMarginPct: number;
  objective: PricingObjective;
  stockQty: number;
  minStock: number;
  marketPrice?: number;
}

export interface SmartPricingRecommendation {
  minPrice: number;
  targetPrice: number;
  premiumPrice: number;
  recommendedPrice: number;

  expectedMarginPct: number;
  breakdown: PricingBreakdown;
  notes: string[];
  warnings: string[];
}

function roundPsychological(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  // arredonda pra terminar em ,99
  const base = Math.ceil(price);
  const out = base - 0.01;
  return Math.max(0, Math.round(out * 100) / 100);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function smartPriceRecommend(input: SmartPricingInputs): SmartPricingRecommendation {
  const {
    product,
    objective,
    marketPrice = 0,
    defaultTargetMarginPct = 30,
    feesPct = 0,
    taxesPct = 0,
  } = input;

  const warnings: string[] = [];
  const notes: string[] = [];

  const cost = Number(product.costPrice || 0);
  const current = Number(product.salePrice || 0);
  const qty = Number(product.quantity || 0);
  const minStock = Math.max(1, Number(product.minStock || 1));

  if (cost <= 0) warnings.push("Custo do produto está zerado ou inválido — a recomendação pode ficar distorcida.");

  const targetMarginPct = Number.isFinite(product.customMargin as any)
    ? Number(product.customMargin)
    : defaultTargetMarginPct;

  const fees = clamp((feesPct ?? 0) / 100, 0, 0.6);
  const taxes = clamp((taxesPct ?? 0) / 100, 0, 0.6);
  const margin = clamp(targetMarginPct / 100, 0.01, 0.7);

  // Base simples MVP: custo direto do produto (v1). Depois podemos somar custos variáveis do Product.
  const baseCost = cost;

  const minDen = 1 - fees - taxes;
  const targetDen = 1 - fees - taxes - margin;

  const minPrice = minDen > 0 ? baseCost / minDen : baseCost * 2;
  const targetPrice = targetDen > 0 ? baseCost / targetDen : minPrice * 1.25;

  const premiumMargin = clamp((targetMarginPct + 15) / 100, 0.05, 0.75);
  const premiumDen = 1 - fees - taxes - premiumMargin;
  const premiumPrice = premiumDen > 0 ? baseCost / premiumDen : targetPrice * 1.2;

  // Sinais simples de estoque (MVP)
  const stockRatio = qty / minStock;
  const isStockHigh = stockRatio >= 3;     // muito acima do mínimo
  const isStockLow = qty <= minStock;      // perto do mínimo / risco de ruptura

  // Ajuste por objetivo
  let recommended = targetPrice;

  if (objective === "lucro") {
    recommended = Math.max(targetPrice, current > 0 ? current * 1.02 : targetPrice);
    notes.push("Objetivo: maximizar margem sem matar conversão.");
    if (isStockLow) {
      recommended = Math.min(premiumPrice, recommended * 1.05);
      notes.push("Estoque baixo: puxei levemente para mais perto do premium.");
    }
    if (isStockHigh) {
      notes.push("Estoque alto: manterei preço perto do alvo (sem desconto agressivo).");
    }
  }

  if (objective === "giro") {
    notes.push("Objetivo: aumentar giro com desconto controlado.");
    let discount = 0.06; // 6% base
    if (isStockHigh) discount = 0.12; // 12% se estoque muito alto
    if (isStockLow) discount = 0.03;  // se estoque baixo, quase não baixa
    recommended = Math.max(minPrice, targetPrice * (1 - discount));
  }

  if (objective === "queima") {
    notes.push("Objetivo: liquidar estoque mantendo break-even.");
    let discount = 0.18; // 18% base
    if (isStockHigh) discount = 0.30; // 30% se estoque muito alto
    if (isStockLow) discount = 0.10;  // se estoque baixo, menos agressivo
    recommended = Math.max(minPrice, targetPrice * (1 - discount));
  }

  // Ajuste por preço de mercado (opcional)
  if (marketPrice && marketPrice > 0) {
    // faixa aceitável ao redor do mercado (MVP)
    const maxAbove = 0.15; // +15%
    const maxBelow = 0.20; // -20%
    const lower = marketPrice * (1 - maxBelow);
    const upper = marketPrice * (1 + maxAbove);

    const before = recommended;
    recommended = clamp(recommended, lower, upper);

    if (Math.abs(before - recommended) / before > 0.02) {
      notes.push("Ajustei a recomendação para ficar próxima do preço de mercado informado.");
    }
  }

  // Nunca abaixo do mínimo
  recommended = Math.max(minPrice, recommended);

  // Arredondamento psicológico
  const recommendedRounded = roundPsychological(recommended);

  const expectedMarginPct =
    recommendedRounded > 0 ? ((recommendedRounded * (1 - fees - taxes) - baseCost) / recommendedRounded) * 100 : 0;

  if (recommendedRounded < current * 0.85) warnings.push("Recomendação bem abaixo do preço atual — confira custo e mercado.");
  if (recommendedRounded > current * 1.25 && current > 0) warnings.push("Recomendação bem acima do preço atual — pode afetar conversão.");

  const breakdown: PricingBreakdown = {
    baseCost,
    feesPct: feesPct ?? 0,
    taxesPct: taxesPct ?? 0,
    targetMarginPct,
    objective,
    stockQty: qty,
    minStock,
    marketPrice: marketPrice > 0 ? marketPrice : undefined,
  };

  return {
    minPrice: Math.round(minPrice * 100) / 100,
    targetPrice: Math.round(targetPrice * 100) / 100,
    premiumPrice: Math.round(premiumPrice * 100) / 100,
    recommendedPrice: Math.round(recommendedRounded * 100) / 100,
    expectedMarginPct: Math.round(expectedMarginPct * 10) / 10,
    breakdown,
    notes,
    warnings,
  };
}
