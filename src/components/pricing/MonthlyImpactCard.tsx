import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Lightbulb, Info } from 'lucide-react';
import { PricingResult, PricingData } from '@/types/pricing';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';

interface MonthlyImpactCardProps {
  result: PricingResult;
  data: PricingData;
}

export function MonthlyImpactCard({ result, data }: MonthlyImpactCardProps) {
  if (!result.viable) return null;

  const calculatedPrice = result.calculatedPrice;
  const netProfit = result.netProfit;
  const monthlyVolume = data.config.monthlyVolume;
  const netMargin = result.netMargin;

  const monthlyRevenue = calculatedPrice * monthlyVolume;
  const monthlyCosts = (calculatedPrice - netProfit) * monthlyVolume;
  const monthlyNetProfit = netProfit * monthlyVolume;

  // Cenários de produção adicional
  const scenarios = [
    { label: '+50 peças/mês', extra: 50 },
    { label: '+100 peças/mês', extra: 100 },
    { label: '+200 peças/mês 🚀', extra: 200, highlight: true },
  ];

  return (
    <Card className="mt-6 bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          Impacto Financeiro Mensal
        </CardTitle>
        <CardDescription>
          Projeção baseada em {monthlyVolume.toLocaleString('pt-BR')} peças por mês
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Financeiro */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Faturamento bruto:</span>
            <span className="font-semibold text-lg">
              {formatarMoeda(monthlyRevenue)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">(-) Custos totais:</span>
            <span className="font-semibold text-lg text-danger">
              -{formatarMoeda(monthlyCosts)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-end pt-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lucro líquido mensal</p>
              <p className="text-xs text-success">
                {formatarPorcentagem(netMargin)} de margem
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-success">
                {formatarMoeda(monthlyNetProfit)}
              </p>
            </div>
          </div>
        </div>

        {/* Simulador de Cenários */}
        <div className="p-4 bg-background/50 backdrop-blur rounded-lg border border-success/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-success" />
            <p className="font-semibold">E se você produzir mais?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((scenario, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  scenario.highlight 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-muted/50'
                }`}
              >
                <p className={`text-xs mb-1 ${scenario.highlight ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                  {scenario.label}
                </p>
                <p className={`text-xl font-bold ${scenario.highlight ? 'text-success' : 'text-success'}`}>
                  +{formatarMoeda(netProfit * scenario.extra)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {formatarMoeda(netProfit * (monthlyVolume + scenario.extra))}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Custos fixos serão ainda mais diluídos, aumentando a margem por peça
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
