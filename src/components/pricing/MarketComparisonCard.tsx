import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Lightbulb, ArrowUp, TrendingUp, Target, Settings2 } from 'lucide-react';
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

  // Se não tem preço de mercado, não mostrar o card grande - apenas um hint pequeno
  if (!marketPrice || marketPrice <= 0) {
    return null;
  }

  // Preço ideal = entre calculado e mercado (se competitivo)
  const idealPrice = marketPrice > 0 && marketPrice > calculatedPrice
    ? Math.min(marketPrice * 0.95, suggestedPrice * 1.1) // 5% abaixo do mercado ou 10% acima do sugerido
    : suggestedPrice;

  const hasOpportunity = marketPrice > 0 && idealPrice > calculatedPrice;
  const extraProfitPerUnit = hasOpportunity ? idealPrice - calculatedPrice : 0;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Comparação com Mercado
        </CardTitle>
        <CardDescription>
          Posicione seu preço estrategicamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preço Calculado */}
          <div className="p-6 bg-primary/5 border-2 border-primary rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-2">Seu Preço Calculado</p>
            <p className="text-4xl font-bold text-primary mb-2">
              {formatarMoeda(calculatedPrice)}
            </p>
            <Badge variant="outline" className="border-primary">
              Baseado em dados reais
            </Badge>
            <p className="text-xs text-muted-foreground mt-3">
              Cobre todos os custos + {desiredMargin}% de lucro
            </p>
          </div>

          {/* Preço de Mercado */}
          <div className="p-6 bg-muted border-2 border-muted-foreground/20 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-2">Preço no Mercado</p>
            <p className="text-4xl font-bold mb-2">
              {formatarMoeda(marketPrice)}
            </p>
            <Badge variant={calculatedPrice < marketPrice ? "default" : "secondary"} className={cn(
              calculatedPrice < marketPrice 
                ? "bg-success text-success-foreground" 
                : "bg-warning text-warning-foreground"
            )}>
              {calculatedPrice < marketPrice 
                ? `Você está ${(((marketPrice - calculatedPrice) / marketPrice) * 100).toFixed(0)}% mais barato`
                : `Você está ${(((calculatedPrice - marketPrice) / marketPrice) * 100).toFixed(0)}% mais caro`
              }
            </Badge>
            <p className="text-xs text-muted-foreground mt-3">
              {calculatedPrice < marketPrice 
                ? "✓ Preço competitivo!"
                : "⚠️ Pode ter dificuldade para vender"
              }
            </p>
          </div>

          {/* Preço Ideal Sugerido */}
          <div className="p-6 bg-success/5 border-2 border-success rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-2">Preço Ideal</p>
            <p className="text-4xl font-bold text-success mb-2">
              {formatarMoeda(idealPrice)}
            </p>
            <Badge className="bg-success text-success-foreground">
              ✓ Recomendado
            </Badge>
            <p className="text-xs text-success mt-3">
              Máximo competitivo com boa margem
            </p>
          </div>
        </div>

        {/* Oportunidade de Lucro */}
        {hasOpportunity && extraProfitPerUnit > 1 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-success/10 via-success/5 to-transparent rounded-lg border border-success/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-success mb-2 flex items-center gap-2">
                  💡 Oportunidade de Lucro Detectada!
                  <Badge className="bg-success text-success-foreground font-normal">
                    +{(((idealPrice - calculatedPrice) / calculatedPrice) * 100).toFixed(0)}% de lucro
                  </Badge>
                </p>
                <p className="text-sm mb-3">
                  O mercado aceita até <strong>{formatarMoeda(marketPrice)}</strong>.
                  Vendendo por <strong>{formatarMoeda(idealPrice)}</strong>, você:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowUp className="h-4 w-4 text-success flex-shrink-0" />
                    <div>
                      <p className="font-medium">Lucro/peça</p>
                      <p className="text-success">
                        {formatarMoeda(netProfit + extraProfitPerUnit)}
                        <span className="text-xs text-muted-foreground ml-1">
                          (era {formatarMoeda(netProfit)})
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success flex-shrink-0" />
                    <div>
                      <p className="font-medium">Lucro/mês</p>
                      <p className="text-success">
                        +{formatarMoeda(extraProfitPerUnit * monthlyVolume)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-success flex-shrink-0" />
                    <div>
                      <p className="font-medium">Competitividade</p>
                      <p className="text-success">
                        {(((marketPrice - idealPrice) / marketPrice) * 100).toFixed(0)}% mais barato
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
