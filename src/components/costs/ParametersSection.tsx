import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ParametrosCalculo } from '@/types/costs';

interface ParametersSectionProps {
  parametros: ParametrosCalculo;
  onUpdate: (parametros: Partial<ParametrosCalculo>) => void;
}

export function ParametersSection({ parametros, onUpdate }: ParametersSectionProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Parâmetros de Cálculo</CardTitle>
        <CardDescription>Configure os parâmetros para calcular o preço ideal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="media-vendas">Média de Peças Vendidas por Mês</Label>
          <Input
            id="media-vendas"
            type="number"
            value={parametros.mediaVendasMes}
            onChange={(e) => onUpdate({ mediaVendasMes: parseInt(e.target.value) || 0 })}
            min="1"
            className="text-lg"
          />
          <p className="text-xs text-muted-foreground">
            Usado para calcular o custo fixo por peça
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="margem-lucro">Margem de Lucro Desejada</Label>
            <span className="text-lg font-semibold text-primary">{parametros.margemLucro}%</span>
          </div>
          <Slider
            id="margem-lucro"
            value={[parametros.margemLucro]}
            onValueChange={(value) => onUpdate({ margemLucro: value[0] })}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Percentual de lucro sobre o preço de venda
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="margem-premium">Margem Premium</Label>
            <span className="text-lg font-semibold text-primary">{parametros.margemPremium}%</span>
          </div>
          <Slider
            id="margem-premium"
            value={[parametros.margemPremium]}
            onValueChange={(value) => onUpdate({ margemPremium: value[0] })}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Margem para posicionamento premium da marca
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
