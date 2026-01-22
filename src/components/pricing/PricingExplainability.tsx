import { BadgeCheck, Info, TrendingUp, Package, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatarMoeda, formatarPorcentagem } from "@/lib/formatters";
import type { SmartPricingRecommendation } from "@/lib/smartPricingEngine";
import type { Product } from "@/types/products";

function objectiveLabel(obj: string) {
  if (obj === "lucro") return "Lucro (margem)";
  if (obj === "giro") return "Giro (vender mais)";
  if (obj === "queima") return "Queima (liquidação)";
  return obj;
}

export function PricingExplainability({
  product,
  rec,
}: {
  product: Product;
  rec: SmartPricingRecommendation;
}) {
  const current = Number(product.salePrice || 0);
  const delta = rec.recommendedPrice - current;
  const deltaPct = current > 0 ? (delta / current) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Por que */}
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Por que esse preço?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              O FEDCOM calcula a recomendação com base em custo, margem e estoque.
            </p>
          </div>
          <Badge variant="outline">{objectiveLabel(rec.breakdown.objective)}</Badge>
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" />
              Custo considerado
            </span>
            <span className="font-medium">{formatarMoeda(rec.breakdown.baseCost)}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Margem alvo
            </span>
            <span className="font-medium">{formatarPorcentagem(rec.breakdown.targetMarginPct, 0)}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Margem estimada (no recomendado)
            </span>
            <span className="font-medium">{formatarPorcentagem(rec.expectedMarginPct, 1)}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
              Estoque atual
            </span>
            <span className="font-medium">
              {rec.breakdown.stockQty} (mín.: {rec.breakdown.minStock})
            </span>
          </div>

          {(rec.breakdown.marketPrice ?? 0) > 0 && (
            <div className="space-y-0.5 col-span-2">
              <span className="text-muted-foreground">Preço de mercado informado</span>
              <span className="font-medium">{formatarMoeda(rec.breakdown.marketPrice || 0)}</span>
            </div>
          )}
        </div>

        {rec.notes?.length > 0 && (
          <>
            <Separator className="my-3" />
            <p className="text-xs font-medium mb-1">Notas</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {rec.notes.slice(0, 5).map((n, i) => (
                <li key={i}>• {n}</li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {/* O que muda */}
      <Card className="p-4">
        <p className="font-medium text-sm mb-1">O que muda se eu aplicar?</p>
        <p className="text-xs text-muted-foreground mb-3">
          Comparação simples com o preço atual.
        </p>

        <Separator className="my-3" />

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="space-y-0.5">
            <span className="text-muted-foreground">Preço atual</span>
            <span className="font-medium block">{formatarMoeda(current)}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground">Preço recomendado</span>
            <span className="font-medium text-primary block">{formatarMoeda(rec.recommendedPrice)}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground">Diferença</span>
            <span className={`font-medium block ${delta >= 0 ? "text-success" : "text-destructive"}`}>
              {formatarMoeda(delta)} {current > 0 ? `(${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(1)}%)` : ""}
            </span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs font-medium flex items-center gap-1 mb-1">
            <Info className="h-3 w-3" />
            Dica rápida
          </p>
          <p className="text-xs text-muted-foreground">
            Se você quer vender mais rápido, use <strong>Giro</strong>.
            Se quer liquidar, use <strong>Queima</strong>.
          </p>
        </div>
      </Card>
    </div>
  );
}
