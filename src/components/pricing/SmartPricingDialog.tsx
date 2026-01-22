import { useMemo, useState } from "react";
import { Product } from "@/types/products";
import { smartPriceRecommend, PricingObjective } from "@/lib/smartPricingEngine";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Sparkles } from "lucide-react";
import { formatarMoeda, formatarPorcentagem } from "@/lib/formatters";
import { PricingExplainability } from "./PricingExplainability";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
  onApplyPrice: (productId: string, newPrice: number) => Promise<void> | void;
}

export function SmartPricingDialog({ open, onOpenChange, product, onApplyPrice }: Props) {
  const [objective, setObjective] = useState<PricingObjective>("lucro");
  const [marketPrice, setMarketPrice] = useState("");

  const parsedMarketPrice = Number(marketPrice.replace(",", ".")) || 0;

  const rec = useMemo(() => {
    if (!product) return null;
    return smartPriceRecommend({
      product,
      objective,
      marketPrice: parsedMarketPrice > 0 ? parsedMarketPrice : undefined,
      defaultTargetMarginPct: 30,
      feesPct: 0,
      taxesPct: 0,
    });
  }, [product, objective, parsedMarketPrice]);

  const canApply = !!product && !!rec && rec.recommendedPrice > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Precificação Inteligente
          </DialogTitle>
          <DialogDescription>
            {product ? `Recomendação de preço para: ${product.name}` : "Selecione um produto."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls (Shopify-style: simples e direto) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Objetivo</label>
              <Select value={objective} onValueChange={(v) => setObjective(v as PricingObjective)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lucro">Lucro (margem)</SelectItem>
                  <SelectItem value="giro">Giro (vender mais)</SelectItem>
                  <SelectItem value="queima">Queima (liquidação)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preço de mercado (opcional)</label>
              <Input
                value={marketPrice}
                onChange={(e) => setMarketPrice(e.target.value)}
                placeholder="Ex.: 129,90"
                inputMode="decimal"
              />
              <p className="text-xs text-muted-foreground">
                Se informado, mantemos a recomendação próxima ao mercado.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Preço atual</label>
              <p className="text-lg font-semibold">{product ? formatarMoeda(product.salePrice) : "-"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Estoque</label>
              <p className="text-lg font-semibold">
                {product ? `${product.quantity} ${product.unit} (mín.: ${product.minStock})` : "-"}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          {product && rec && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-muted">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs text-muted-foreground">Preço mínimo</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <p className="text-lg font-bold">{formatarMoeda(rec.minPrice)}</p>
                    <p className="text-xs text-muted-foreground">Break-even (sem margem)</p>
                  </CardContent>
                </Card>

                <Card className="border-muted">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs text-muted-foreground">Preço alvo</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <p className="text-lg font-bold">{formatarMoeda(rec.targetPrice)}</p>
                    <p className="text-xs text-muted-foreground">Meta de margem (padrão)</p>
                  </CardContent>
                </Card>

                <Card className="border-muted">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs text-muted-foreground">Preço premium</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <p className="text-lg font-bold">{formatarMoeda(rec.premiumPrice)}</p>
                    <p className="text-xs text-muted-foreground">Para escassez/demanda</p>
                  </CardContent>
                </Card>

                <Card className="border-primary bg-primary/5">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs text-primary flex items-center gap-1">
                      Recomendado
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">Assistente</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <p className="text-xl font-bold text-primary">{formatarMoeda(rec.recommendedPrice)}</p>
                    <p className="text-xs text-muted-foreground">
                      Margem estimada: {formatarPorcentagem(rec.expectedMarginPct, 1)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Explainability Section */}
              <PricingExplainability product={product} rec={rec} />

              {rec.warnings.length > 0 && (
                <div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
                  <div className="flex items-center gap-2 text-warning font-medium text-sm mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    Atenção
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {rec.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between border-t pt-4">
                <div className="text-sm space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Você sempre pode ajustar. A recomendação é um ponto de partida.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                  <p className="text-xs text-muted-foreground text-right">
                    Aplicar atualiza o preço de venda do produto.
                  </p>
                  <Button
                    disabled={!canApply}
                    onClick={async () => {
                      if (!product || !rec) return;
                      await onApplyPrice(product.id, rec.recommendedPrice);
                      onOpenChange(false);
                    }}
                  >
                    Aplicar preço
                  </Button>
                </div>
              </div>
            </>
          )}

          {!product && (
            <p className="text-muted-foreground text-center py-6">Nenhum produto selecionado.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
