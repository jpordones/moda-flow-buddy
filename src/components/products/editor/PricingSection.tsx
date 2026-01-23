import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarMoeda, formatarPorcentagem } from "@/lib/formatters";
import { useMemo } from "react";

interface PricingSectionProps {
  costPrice: number;
  salePrice: number;
  onChange: (field: string, value: number) => void;
}

export function PricingSection({
  costPrice,
  salePrice,
  onChange,
}: PricingSectionProps) {
  const profitMargin = useMemo(() => {
    if (salePrice <= 0 || costPrice < 0) return 0;
    return ((salePrice - costPrice) / salePrice) * 100;
  }, [costPrice, salePrice]);

  const profit = useMemo(() => {
    return salePrice - costPrice;
  }, [costPrice, salePrice]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Preços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="costPrice">Custo *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={costPrice || ''}
                onChange={(e) => onChange('costPrice', parseFloat(e.target.value) || 0)}
                className="h-11 pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Quanto você paga por este produto
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salePrice">Preço de venda *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={salePrice || ''}
                onChange={(e) => onChange('salePrice', parseFloat(e.target.value) || 0)}
                className="h-11 pl-10"
              />
            </div>
          </div>
        </div>

        {/* Margin display */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Margem de lucro</p>
              <p className="text-xs text-muted-foreground">Calculada automaticamente</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${profitMargin < 0 ? 'text-destructive' : profitMargin < 20 ? 'text-warning' : 'text-success'}`}>
                {formatarPorcentagem(profitMargin, 1)}
              </p>
              <p className="text-xs text-muted-foreground">
                Lucro: {formatarMoeda(profit)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
