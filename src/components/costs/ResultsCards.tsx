import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Banknote } from 'lucide-react';
import { ResultadosCalculo } from '@/types/costs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';

interface ResultsCardsProps {
  resultados: ResultadosCalculo;
}

export function ResultsCards({ resultados }: ResultsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-lg transition-all cursor-help">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Custo Total/Peça
                </CardTitle>
                <div className="p-2 rounded-lg bg-info-light">
                  <Package className="h-5 w-5 text-info" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-3xl font-bold text-gray-900">
                  {formatarMoeda(resultados.custoRealCompleto)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Custo completo por unidade
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">Breakdown do Custo:</p>
              <p>Variável: {formatarMoeda(resultados.custoVariavelTotal)}</p>
              <p>Fixo: {formatarMoeda(resultados.custoFixoPorPeca)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
          <CardTitle className="text-sm font-medium text-gray-600">
            Preço Ideal de Venda
          </CardTitle>
          <div className="p-2 rounded-lg bg-brand/20">
            <DollarSign className="h-5 w-5 text-brand-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-3xl font-bold text-brand-foreground">
            {formatarMoeda(resultados.precoIdeal)}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Com margem de {formatarPorcentagem(resultados.margemPercentual)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
          <CardTitle className="text-sm font-medium text-gray-600">
            Margem de Lucro
          </CardTitle>
          <div className="p-2 rounded-lg bg-success-light">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-3xl font-bold text-success">
            {formatarPorcentagem(resultados.margemPercentual)}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {formatarMoeda(resultados.lucroPorPeca)} por peça
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
          <CardTitle className="text-sm font-medium text-gray-600">
            Lucro por Peça
          </CardTitle>
          <div className="p-2 rounded-lg bg-success-light">
            <Banknote className="h-5 w-5 text-success" />
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-3xl font-bold text-success">
            {formatarMoeda(resultados.lucroPorPeca)}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Lucro líquido por unidade
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
