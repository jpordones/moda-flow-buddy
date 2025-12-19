import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, Package, AlertTriangle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForecastResult {
  previsao_proximos_30_dias: number;
  tendencia: 'crescimento' | 'estável' | 'queda';
  variacao_percentual: number;
  sazonalidade: string;
  estoque_recomendado: number;
  confianca: 'baixa' | 'média' | 'alta';
  insights: string[];
  recomendacoes: string[];
}

interface HistoricalData {
  mes: string;
  vendas: number;
}

export function DemandForecast() {
  const [productName, setProductName] = useState("");
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([
    { mes: "Janeiro", vendas: 0 },
    { mes: "Fevereiro", vendas: 0 },
    { mes: "Março", vendas: 0 },
    { mes: "Abril", vendas: 0 },
    { mes: "Maio", vendas: 0 },
    { mes: "Junho", vendas: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);

  const updateSales = (index: number, value: string) => {
    const newData = [...historicalData];
    newData[index].vendas = parseInt(value) || 0;
    setHistoricalData(newData);
  };

  const handleForecast = async () => {
    if (!productName.trim()) {
      toast.error("Digite o nome do produto");
      return;
    }

    const hasData = historicalData.some(d => d.vendas > 0);
    if (!hasData) {
      toast.error("Preencha pelo menos um mês com dados de vendas");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('demand-forecast', {
        body: { 
          productName, 
          historicalData,
          period: 'últimos 6 meses'
        }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setForecast(data.forecast);
      toast.success("Previsão gerada com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar previsão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescimento': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'queda': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getConfidenceBadge = (confianca: string) => {
    const colors = {
      alta: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      média: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      baixa: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[confianca as keyof typeof colors] || colors.baixa;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Previsão de Demanda com IA
          </CardTitle>
          <CardDescription>
            Insira os dados históricos de vendas para gerar uma previsão inteligente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="productName">Nome do Produto</Label>
            <Input
              id="productName"
              placeholder="Ex: Camiseta Básica Preta"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Histórico de Vendas (últimos 6 meses)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-2">
              {historicalData.map((item, index) => (
                <div key={item.mes} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{item.mes}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={item.vendas || ''}
                    onChange={(e) => updateSales(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleForecast} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando dados...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Gerar Previsão
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {forecast && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Previsão (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{forecast.previsao_proximos_30_dias}</span>
                <span className="text-muted-foreground">unidades</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon(forecast.tendencia)}
                <span className="text-sm capitalize">{forecast.tendencia}</span>
                <span className={`text-sm ${forecast.variacao_percentual >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ({forecast.variacao_percentual >= 0 ? '+' : ''}{forecast.variacao_percentual}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Estoque Recomendado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{forecast.estoque_recomendado}</span>
                <span className="text-muted-foreground">unidades</span>
              </div>
              <Badge className={`mt-2 ${getConfidenceBadge(forecast.confianca)}`}>
                Confiança {forecast.confianca}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sazonalidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{forecast.sazonalidade}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {forecast.insights.map((insight, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {forecast.recomendacoes.map((rec, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
