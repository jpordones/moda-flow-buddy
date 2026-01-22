import { smartPriceRecommend } from "@/lib/smartPricingEngine";
import type { Product } from "@/types/products";

export type ActionType =
  | "PRICE_BELOW_MIN"
  | "LOW_STOCK"
  | "HIGH_STOCK"
  | "PRICE_OPPORTUNITY";

export type ActionSeverity = "critical" | "warning" | "info";

export interface ActionItem {
  id: string;
  type: ActionType;
  severity: ActionSeverity;

  productId: string;
  productName: string;

  title: string;
  description: string;

  // para navegação
  ctaLabel: string;
  ctaHref: string;

  meta?: Record<string, any>;
}

function money(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
}

/**
 * Central de Ações v1 (heurística):
 * - Detecta preço abaixo do mínimo (crítico)
 * - Estoque baixo (warning)
 * - Estoque alto (info -> oportunidade de giro/queima)
 * - Oportunidade de preço (diferença grande entre atual e recomendado)
 */
export function buildActionCenter(products: Product[]): ActionItem[] {
  const actions: ActionItem[] = [];

  for (const p of products) {
    const qty = Number(p.quantity || 0);
    const minStock = Math.max(1, Number(p.minStock || 1));
    const salePrice = Number(p.salePrice || 0);

    // preço recomendado (por lucro) para sinalizar oportunidade
    const recLucro = smartPriceRecommend({ product: p, objective: "lucro" });
    const recGiro = smartPriceRecommend({ product: p, objective: "giro" });

    // 1) Preço abaixo do mínimo
    if (salePrice > 0 && recLucro.minPrice > 0 && salePrice < recLucro.minPrice) {
      actions.push({
        id: `PRICE_BELOW_MIN:${p.id}`,
        type: "PRICE_BELOW_MIN",
        severity: "critical",
        productId: p.id,
        productName: p.name,
        title: "Preço abaixo do mínimo",
        description: `Preço atual (${money(salePrice)}) está abaixo do mínimo (${money(recLucro.minPrice)}).`,
        ctaLabel: "Ajustar preço",
        ctaHref: `/produtos?smartPricing=${encodeURIComponent(p.id)}&objective=lucro`,
        meta: { minPrice: recLucro.minPrice, current: salePrice, suggested: recLucro.recommendedPrice },
      });
    }

    // 2) Estoque baixo / risco de ruptura
    if (qty <= minStock) {
      actions.push({
        id: `LOW_STOCK:${p.id}`,
        type: "LOW_STOCK",
        severity: "warning",
        productId: p.id,
        productName: p.name,
        title: "Risco de ruptura",
        description: `Estoque atual (${qty}) está no mínimo (mín.: ${minStock}).`,
        ctaLabel: "Ver no estoque",
        ctaHref: `/estoque?focus=${encodeURIComponent(p.id)}`,
        meta: { qty, minStock },
      });
    }

    // 3) Estoque alto (heurística simples)
    // v1: se estoque >= 3x do mínimo, sinaliza potencial de giro/queima
    if (qty >= minStock * 3) {
      actions.push({
        id: `HIGH_STOCK:${p.id}`,
        type: "HIGH_STOCK",
        severity: "info",
        productId: p.id,
        productName: p.name,
        title: "Estoque alto (oportunidade)",
        description: `Estoque alto (${qty}). Você pode acelerar giro com estratégia de preço.`,
        ctaLabel: "Preço para giro",
        ctaHref: `/produtos?smartPricing=${encodeURIComponent(p.id)}&objective=giro`,
        meta: { qty, minStock, suggested: recGiro.recommendedPrice },
      });
    }

    // 4) Oportunidade: recomendado muito distante do preço atual
    if (salePrice > 0 && recLucro.recommendedPrice > 0) {
      const diffPct = Math.abs(recLucro.recommendedPrice - salePrice) / salePrice;
      if (diffPct >= 0.15) {
        actions.push({
          id: `PRICE_OPPORTUNITY:${p.id}`,
          type: "PRICE_OPPORTUNITY",
          severity: "info",
          productId: p.id,
          productName: p.name,
          title: "Oportunidade de ajuste",
          description: `Recomendação (${money(recLucro.recommendedPrice)}) difere do preço atual (${money(salePrice)}).`,
          ctaLabel: "Ver recomendação",
          ctaHref: `/produtos?smartPricing=${encodeURIComponent(p.id)}&objective=lucro`,
          meta: { current: salePrice, suggested: recLucro.recommendedPrice, diffPct },
        });
      }
    }
  }

  // ordenação por severidade (Shopify-like: crítico > warning > info)
  const weight: Record<ActionSeverity, number> = { critical: 3, warning: 2, info: 1 };
  return actions.sort((a, b) => weight[b.severity] - weight[a.severity]);
}

export function summarizeActions(actions: ActionItem[]) {
  const critical = actions.filter(a => a.severity === "critical").length;
  const warning = actions.filter(a => a.severity === "warning").length;
  const info = actions.filter(a => a.severity === "info").length;
  return { critical, warning, info, total: actions.length };
}
