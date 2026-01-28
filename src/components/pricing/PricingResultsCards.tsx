import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, TrendingUp, Banknote, Target, BarChart3 } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Preço Sugerido */}
      <Card className="border-success/50 bg-success/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Preço Sugerido</span>
            <div className="p-2 rounded-lg bg-success/20">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-success">
            {formatarMoeda(result.suggestedPrice)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Calculado: {formatarMoeda(result.calculatedPrice)}
          </p>
        </CardContent>
      </Card>

      {/* Custo Total */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Custo Total/Peça</span>
            <div className="p-2 rounded-lg bg-info/20">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {formatarMoeda(result.totalCostBeforeSale + result.variableFixedCosts)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Produto + Fixos + Variáveis
          </p>
        </CardContent>
      </Card>

      {/* Lucro Líquido */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Lucro Líquido</span>
            <div className="p-2 rounded-lg bg-success/20">
              <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-success">
            {formatarMoeda(result.netProfit)}
          </div>
          <Badge variant={result.netMargin >= 20 ? 'default' : 'secondary'} className="mt-1">
            {formatarPorcentagem(result.netMargin)} de margem
          </Badge>
        </CardContent>
      </Card>

      {/* Margem */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Margem Líquida</span>
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${result.netMargin >= 20 ? 'text-success' : result.netMargin >= 10 ? 'text-warning' : 'text-danger'}`}>
            {formatarPorcentagem(result.netMargin)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {result.netMargin >= 20 ? '✓ Saudável' : result.netMargin >= 10 ? '⚠️ Baixa' : '❌ Crítica'}
          </p>
        </CardContent>
      </Card>

      {/* Preço Mínimo */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Preço Mínimo</span>
            <div className="p-2 rounded-lg bg-warning/20">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-warning">
            {formatarMoeda(result.minimumPrice)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Break-even (lucro zero)
          </p>
        </CardContent>
      </Card>

      {/* Competitividade - só mostra se tem preço de mercado */}
      {result.competitiveness !== null && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">vs. Mercado</span>
              <div className="p-2 rounded-lg bg-muted">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${result.competitiveness <= 0 ? 'text-success' : 'text-warning'}`}>
              {result.competitiveness > 0 ? '+' : ''}{result.competitiveness.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {result.competitiveness <= 0 ? '✓ Competitivo' : '⚠️ Acima do mercado'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
