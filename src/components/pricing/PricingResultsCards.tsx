import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Banknote } from 'lucide-react';
import { PricingResult } from '@/types/pricing';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';

interface PricingResultsCardsProps {
  result: PricingResult;
}

export function PricingResultsCards({ result }: PricingResultsCardsProps) {
  if (!result.viable) {
    return (
      <Card className="border-danger bg-danger/10">
        <CardContent className="p-6 text-center">
          <p className="text-danger font-semibold text-lg">⚠️ {result.error}</p>
          <p className="text-muted-foreground mt-2">Ajuste as taxas, impostos ou margem para continuar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Preço Sugerido */}
      <Card className="border-success/50 bg-gradient-to-br from-success/10 to-success/5">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Preço Sugerido</span>
            <div className="p-2 rounded-lg bg-success/20">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-success">
            {formatarMoeda(result.suggestedPrice)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Calculado: {formatarMoeda(result.calculatedPrice)}
          </p>
        </CardContent>
      </Card>

      {/* Custo Total */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Custo Total/Peça</span>
            <div className="p-2 rounded-lg bg-info/20">
              <Package className="h-5 w-5 text-info" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-foreground">
            {formatarMoeda(result.totalCostBeforeSale + result.variableFixedCosts)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Produto + Fixos + Variáveis
          </p>
        </CardContent>
      </Card>

      {/* Lucro Líquido */}
      <Card className="border-primary/30">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Lucro Líquido</span>
            <div className="p-2 rounded-lg bg-primary/20">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-primary">
            {formatarMoeda(result.netProfit)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant={result.netMargin >= 20 ? 'default' : 'secondary'} 
              className={result.netMargin >= 20 ? 'bg-success text-success-foreground' : result.netMargin >= 10 ? 'bg-warning text-warning-foreground' : 'bg-danger text-danger-foreground'}
            >
              {formatarPorcentagem(result.netMargin)} margem
            </Badge>
            <span className="text-xs text-muted-foreground">
              {result.netMargin >= 20 ? '✓ Saudável' : result.netMargin >= 10 ? '⚠️ Baixa' : '❌ Crítica'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
