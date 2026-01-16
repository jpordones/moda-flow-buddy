import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PricingConfig } from '@/types/pricing';
import { formatarMoeda } from '@/lib/formatters';

interface VolumeAndMarginSectionProps {
  config: PricingConfig;
  totalFixedCosts: number;
  onUpdate: (updates: Partial<PricingConfig>) => void;
}

export function VolumeAndMarginSection({ config, totalFixedCosts, onUpdate }: VolumeAndMarginSectionProps) {
  const fixedCostPerUnit = config.monthlyVolume > 0 ? totalFixedCosts / config.monthlyVolume : 0;
  
  return (
    <div className="space-y-6">
      {/* Volume de Produção */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-foreground text-lg">Volume de Produção Mensal</CardTitle>
              <CardDescription>
                Quantas peças você produz ou vende por mês? Isso dilui os custos fixos.
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>O volume de produção é crucial! Quanto mais peças você vende, menor o custo fixo por unidade.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="monthlyVolume">Volume Mensal Estimado</Label>
              <Input
                id="monthlyVolume"
                type="number"
                min={1}
                value={config.monthlyVolume}
                onChange={(e) => onUpdate({ monthlyVolume: Math.max(1, Number(e.target.value)) })}
                placeholder="Ex: 500 peças/mês"
                className="h-12 text-base mt-1"
              />
            </div>
            <div className="sm:w-48">
              <Label>Custo Fixo por Unidade</Label>
              <div className="h-12 flex items-center justify-center bg-background border rounded-md mt-1 text-lg font-semibold text-primary">
                {formatarMoeda(fixedCostPerUnit)}
              </div>
            </div>
          </div>
          
          {config.monthlyVolume > 0 && (
            <div className="p-3 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground">
                📊 Cada peça absorverá <span className="font-semibold text-foreground">{formatarMoeda(fixedCostPerUnit)}</span> de custos fixos
              </p>
              {totalFixedCosts > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total mensal: {formatarMoeda(totalFixedCosts)} ÷ {config.monthlyVolume} peças
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Margem de Lucro */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/20">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-foreground text-lg">Margem de Lucro</CardTitle>
              <CardDescription>
                Defina quanto você quer lucrar em cada venda
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Margem Desejada */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Margem Desejada (%)</Label>
              <span className="text-2xl font-bold text-success">{config.desiredMargin}%</span>
            </div>
            <Slider
              min={5}
              max={60}
              step={1}
              value={[config.desiredMargin]}
              onValueChange={([value]) => onUpdate({ desiredMargin: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5% (baixa)</span>
              <span>30% (ideal)</span>
              <span>60% (premium)</span>
            </div>
          </div>

          {/* Margem Mínima */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Margem Mínima Aceitável (%)</Label>
              <span className="text-lg font-semibold text-warning">{config.minimumMargin}%</span>
            </div>
            <Slider
              min={0}
              max={30}
              step={1}
              value={[config.minimumMargin]}
              onValueChange={([value]) => onUpdate({ minimumMargin: value })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Se a margem calculada ficar abaixo desse valor, você receberá um alerta.
            </p>
          </div>

          {/* Preço de Mercado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="marketPrice">Preço de Mercado (R$)</Label>
              <Input
                id="marketPrice"
                type="number"
                min={0}
                step={0.01}
                value={config.marketPrice || ''}
                onChange={(e) => onUpdate({ marketPrice: Number(e.target.value) })}
                placeholder="Ex: 89.90"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para comparar com concorrentes
              </p>
            </div>
            <div>
              <Label htmlFor="competitorPrice">Preço do Concorrente (R$)</Label>
              <Input
                id="competitorPrice"
                type="number"
                min={0}
                step={0.01}
                value={config.competitorPrice || ''}
                onChange={(e) => onUpdate({ competitorPrice: Number(e.target.value) })}
                placeholder="Ex: 79.90"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Opcional - referência
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
