import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Banknote, Info } from 'lucide-react';
import { PricingResult } from '@/types/pricing';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  // ============================================================
  // CÁLCULOS CONSISTENTES - usando a fórmula oficial
  // ============================================================
  // Custo Total/Peça = Custo Direto + Fixos Diluídos + Variáveis (R$) + Taxas (R$) + Impostos (R$)
  const custosDiretos = result.directCost;
  const custosFixosDiluidos = result.fixedCostPerUnit;
  const custosVariaveisFixos = result.variableFixedCosts; // R$ frete, embalagem
  const taxasVenda = result.suggestedPrice * result.variableFeesPercent;
  const impostos = result.suggestedPrice * result.taxPercent;
  
  // Total de custos (antes do lucro)
  const custoTotalPeca = custosDiretos + custosFixosDiluidos + custosVariaveisFixos + taxasVenda + impostos;
  
  // Lucro Líquido = Preço Sugerido - Custo Total
  const lucroLiquido = result.suggestedPrice - custoTotalPeca;
  
  // Margem Líquida = (Lucro / Preço) * 100
  const margemLiquida = result.suggestedPrice > 0 
    ? (lucroLiquido / result.suggestedPrice) * 100 
    : 0;

  // Status da margem
  const getMarginStatus = () => {
    if (margemLiquida >= 20) return { label: 'Saudável', variant: 'success' as const, emoji: '✓' };
    if (margemLiquida >= 10) return { label: 'Baixa', variant: 'warning' as const, emoji: '⚠️' };
    return { label: 'Crítica', variant: 'danger' as const, emoji: '❌' };
  };
  
  const marginStatus = getMarginStatus();

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 cursor-help">
                  <Info className="h-3 w-3" />
                  Calculado: {formatarMoeda(result.calculatedPrice)}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">
                  Preço matemático calculado pela fórmula. O "Sugerido" é arredondado para R$ X,99 (preço psicológico).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Custo Total/Peça */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Custo Total/Peça</span>
            <div className="p-2 rounded-lg bg-info/20">
              <Package className="h-5 w-5 text-info" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-foreground">
            {formatarMoeda(custoTotalPeca)}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 cursor-help">
                  <Info className="h-3 w-3" />
                  Produto + Fixos + Venda + Impostos
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[280px]">
                <div className="text-xs space-y-1">
                  <p>Diretos: {formatarMoeda(custosDiretos)}</p>
                  <p>Fixos diluídos: {formatarMoeda(custosFixosDiluidos)}</p>
                  <p>Venda (R$+%): {formatarMoeda(custosVariaveisFixos + taxasVenda)}</p>
                  <p>Impostos: {formatarMoeda(impostos)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            {formatarMoeda(lucroLiquido)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="secondary"
              className={
                marginStatus.variant === 'success' 
                  ? 'bg-success text-success-foreground' 
                  : marginStatus.variant === 'warning' 
                    ? 'bg-warning text-warning-foreground' 
                    : 'bg-danger text-danger-foreground'
              }
            >
              {formatarPorcentagem(margemLiquida)} margem
            </Badge>
            <span className="text-xs text-muted-foreground">
              {marginStatus.emoji} {marginStatus.label}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
