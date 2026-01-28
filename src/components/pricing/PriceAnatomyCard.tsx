import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Box, 
  Building2, 
  ShoppingCart, 
  Receipt, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PricingResult, PricingData } from '@/types/pricing';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';

interface PriceAnatomyCardProps {
  result: PricingResult;
  data: PricingData;
}

interface AnatomyItem {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  details?: string[];
}

export function PriceAnatomyCard({ result, data }: PriceAnatomyCardProps) {
  if (!result.viable) return null;

  const precoSugerido = result.suggestedPrice;
  const monthlyVolume = data.config.monthlyVolume;
  const totalFixedCosts = result.totalFixedCostsMonthly;

  // ============================================================
  // CÁLCULOS EXATOS - mesma fórmula do PricingResultsCards
  // ============================================================
  const custosDiretos = result.directCost;
  const custosFixosDiluidos = result.fixedCostPerUnit;
  const custosVariaveisFixos = result.variableFixedCosts; // R$ frete, embalagem
  const taxasVenda = precoSugerido * result.variableFeesPercent;
  const impostos = precoSugerido * result.taxPercent;
  
  // Total de custos (antes do lucro)
  const custoTotalPeca = custosDiretos + custosFixosDiluidos + custosVariaveisFixos + taxasVenda + impostos;
  
  // Lucro Líquido = Preço Sugerido - Custo Total
  const lucroLiquido = precoSugerido - custoTotalPeca;

  // Validação: soma deve bater com preço
  const totalCalculated = custoTotalPeca + lucroLiquido;
  const isBalanced = Math.abs(totalCalculated - precoSugerido) < 0.02;

  const items: AnatomyItem[] = [
    {
      icon: <Box className="h-5 w-5" />,
      label: 'Custos Diretos do Produto',
      value: custosDiretos,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      details: [
        data.productCosts.fabric > 0 ? `Material: ${formatarMoeda(data.productCosts.fabric)}` : '',
        data.productCosts.accessories > 0 ? `Aviamentos: ${formatarMoeda(data.productCosts.accessories)}` : '',
        data.productCosts.packaging > 0 ? `Embalagem: ${formatarMoeda(data.productCosts.packaging)}` : '',
        data.productCosts.laborCost > 0 ? `Mão de obra: ${formatarMoeda(data.productCosts.laborCost)}` : '',
      ].filter(Boolean),
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: 'Custos Fixos Diluídos',
      value: custosFixosDiluidos,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      details: [`${formatarMoeda(totalFixedCosts)}/mês ÷ ${monthlyVolume.toLocaleString('pt-BR')} peças`],
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: 'Custos de Venda',
      value: custosVariaveisFixos + taxasVenda,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      details: [
        data.variableCosts.marketplaceFee > 0 ? `Marketplace: ${formatarPorcentagem(data.variableCosts.marketplaceFee)}` : '',
        data.variableCosts.paymentGateway > 0 ? `Gateway: ${formatarPorcentagem(data.variableCosts.paymentGateway)}` : '',
        data.variableCosts.shippingCost > 0 ? `Frete: ${formatarMoeda(data.variableCosts.shippingCost)}` : '',
        data.variableCosts.adsCost > 0 ? `Marketing: ${formatarPorcentagem(data.variableCosts.adsCost)}` : '',
      ].filter(Boolean),
    },
    {
      icon: <Receipt className="h-5 w-5" />,
      label: 'Impostos',
      value: impostos,
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      details: [
        data.taxes.taxRegime === 'simples' 
          ? `Simples Nacional: ${formatarPorcentagem(result.taxPercent * 100)}`
          : `ICMS + PIS + COFINS: ${formatarPorcentagem(result.taxPercent * 100)}`
      ],
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5" />
          Anatomia do Preço
        </CardTitle>
        <CardDescription>
          De onde vem cada centavo do preço de {formatarMoeda(precoSugerido)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Breakdown visual compacto */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const percent = precoSugerido > 0 ? (item.value / precoSugerido) * 100 : 0;
            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={item.color}>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">
                      {formatarPorcentagem(percent)}
                    </span>
                    <span className="font-semibold w-24 text-right">
                      {formatarMoeda(item.value)}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={percent} 
                  className={`h-2 [&>div]:${item.bgColor}`}
                />
                {item.details && item.details.length > 0 && (
                  <p className="text-xs text-muted-foreground pl-7">
                    {item.details.join(' • ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Lucro - destaque */}
        <div className="p-4 bg-success/10 rounded-lg border border-success/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-success" />
              <span className="font-bold text-success">Seu Lucro</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-success text-sm font-medium">
                {formatarPorcentagem((lucroLiquido / precoSugerido) * 100)}
              </span>
              <span className="text-2xl font-bold text-success">
                {formatarMoeda(lucroLiquido)}
              </span>
            </div>
          </div>
          <Progress 
            value={(lucroLiquido / precoSugerido) * 100} 
            className="h-2 mt-2 [&>div]:bg-success"
          />
        </div>

        {/* Validação visual */}
        <div className={`flex items-center justify-between p-3 rounded-lg text-sm ${isBalanced ? 'bg-muted' : 'bg-warning/10 border border-warning'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${isBalanced ? 'text-success' : 'text-warning'}`} />
            <span className="text-muted-foreground">Soma dos componentes:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold">{formatarMoeda(totalCalculated)}</span>
            <span className="text-muted-foreground">=</span>
            <span className="font-mono font-semibold text-success">{formatarMoeda(precoSugerido)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
