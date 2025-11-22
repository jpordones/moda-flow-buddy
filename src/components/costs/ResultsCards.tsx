import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Banknote } from 'lucide-react';
import { ResultadosCalculo } from '@/types/costs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResultsCardsProps {
  resultados: ResultadosCalculo;
}

export function ResultsCards({ resultados }: ResultsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="shadow-md hover:shadow-lg transition-all cursor-help">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Custo Total/Peça
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Package className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {resultados.custoRealCompleto.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Custo completo por unidade
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">Breakdown do Custo:</p>
              <p>Variável: R$ {resultados.custoVariavelTotal.toFixed(2)}</p>
              <p>Fixo: R$ {resultados.custoFixoPorPeca.toFixed(2)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Card className="shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Preço Ideal de Venda
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            R$ {resultados.precoIdeal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Com margem de {resultados.margemPercentual.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-success/5 to-success/10 border-success/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Margem de Lucro
          </CardTitle>
          <div className="p-2 rounded-lg bg-success/20 text-success">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {resultados.margemPercentual.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            R$ {resultados.lucroPorPeca.toFixed(2)} por peça
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-success/5 to-success/10 border-success/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Lucro por Peça
          </CardTitle>
          <div className="p-2 rounded-lg bg-success/20 text-success">
            <Banknote className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            R$ {resultados.lucroPorPeca.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lucro líquido por unidade
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
