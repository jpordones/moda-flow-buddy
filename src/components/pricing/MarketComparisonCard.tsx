import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Lightbulb, ArrowUp, TrendingUp, Target, Plus } from 'lucide-react';
import { PricingResult, PricingData } from '@/types/pricing';
import { formatarMoeda } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MarketComparisonCardProps {
  result: PricingResult;
  data: PricingData;
  onScrollToConfig?: () => void;
}

export function MarketComparisonCard({ result, data, onScrollToConfig }: MarketComparisonCardProps) {
  if (!result.viable) return null;

  const calculatedPrice = result.calculatedPrice;
  const suggestedPrice = result.suggestedPrice;
  const marketPrice = data.config.marketPrice;
  const desiredMargin = data.config.desiredMargin;
  const netProfit = result.netProfit;
  const monthlyVolume = data.config.monthlyVolume;

  // Se não tem preço de mercado, mostrar CTA compacto
  if (!marketPrice || marketPrice <= 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-dashed">
        <Scale className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Compare com a concorrência</p>
          <p className="text-xs text-muted-foreground">Preencha o preço de mercado nas configurações abaixo</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onScrollToConfig}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
    );
  }

  // Preço ideal = entre calculado e mercado (se competitivo)
  const idealPrice = marketPrice > calculatedPrice
    ? Math.min(marketPrice * 0.95, suggestedPrice * 1.1)
    : suggestedPrice;

  const hasOpportunity = idealPrice > calculatedPrice;
  const extraProfitPerUnit = hasOpportunity ? idealPrice - calculatedPrice : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5" />
          Comparação com Mercado
        </CardTitle>
        <CardDescription>
          Posicione seu preço estrategicamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Preço Calculado */}
          <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Seu Preço</p>
            <p className="text-2xl font-bold text-primary">
              {formatarMoeda(calculatedPrice)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {desiredMargin}% margem
            </p>
          </div>

          {/* Preço de Mercado */}
          <div className="p-4 bg-muted border border-muted-foreground/20 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Mercado</p>
            <p className="text-2xl font-bold">
              {formatarMoeda(marketPrice)}
            </p>
            <Badge 
              variant="secondary" 
              className={cn(
                "mt-1 text-xs",
                calculatedPrice < marketPrice 
                  ? "bg-success/20 text-success" 
                  : "bg-warning/20 text-warning"
              )}
            >
              {calculatedPrice < marketPrice 
                ? `${(((marketPrice - calculatedPrice) / marketPrice) * 100).toFixed(0)}% mais barato`
                : `${(((calculatedPrice - marketPrice) / marketPrice) * 100).toFixed(0)}% mais caro`
              }
            </Badge>
          </div>

          {/* Preço Ideal */}
          <div className="p-4 bg-success/5 border border-success/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Recomendado</p>
            <p className="text-2xl font-bold text-success">
              {formatarMoeda(idealPrice)}
            </p>
            <p className="text-xs text-success mt-1">
              ✓ Máx. competitivo
            </p>
          </div>
        </div>

        {/* Oportunidade de Lucro - compacto */}
        {hasOpportunity && extraProfitPerUnit > 1 && (
          <div className="mt-4 p-3 bg-success/5 rounded-lg border border-success/20 flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-success flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-medium text-success">Oportunidade:</span>
              {' '}vendendo por {formatarMoeda(idealPrice)}, ganhe{' '}
              <strong className="text-success">+{formatarMoeda(extraProfitPerUnit * monthlyVolume)}/mês</strong>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
