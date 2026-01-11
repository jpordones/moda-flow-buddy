import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, Package, AlertTriangle, Lightbulb, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Schema de validação para inputs
const demandForecastSchema = z.object({
  productName: z.string()
    .min(1, 'Nome do produto é obrigatório')
    .max(100, 'Nome muito longo (máximo 100 caracteres)')
    .regex(/^[a-zA-Z0-9\s\-_áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]+$/, 'Nome contém caracteres inválidos'),
});

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateSales = (index: number, value: string) => {
    const newData = [...historicalData];
    // Sanitiza o valor para aceitar apenas números positivos
    const sanitizedValue = Math.max(0, Math.min(parseInt(value) || 0, 999999));
    newData[index].vendas = sanitizedValue;
    setHistoricalData(newData);
  };

  const sanitizeInput = (input: string, maxLength: number): string => {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, ''); // Remove caracteres potencialmente perigosos
  };

  const validateInputs = (): boolean => {
    try {
      demandForecastSchema.parse({
        productName: productName.trim(),
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Dados inválidos', {
          description: 'Verifique os campos e tente novamente'
        });
      }
      return false;
    }
  };

  const handleForecast = async () => {
    // Validação com Zod
    if (!validateInputs()) return;

    const hasData = historicalData.some(d => d.vendas > 0);
    if (!hasData) {
      toast.error("Dados insuficientes", {
        description: "Preencha pelo menos um mês com dados de vendas"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Sanitização do nome do produto
      const sanitizedProductName = sanitizeInput(productName, 100);

      // Sanitização dos dados históricos (limita valores)
      const sanitizedHistoricalData = historicalData.map(item => ({
        mes: sanitizeInput(item.mes, 20),
        vendas: Math.max(0, Math.min(item.vendas, 999999))
      }));

      // Limita o tamanho total do payload
      const payload = {
        productName: sanitizedProductName,
        historicalData: sanitizedHistoricalData,
        period: 'últimos 6 meses'
      };

      const payloadSize = JSON.stringify(payload).length;
      if (payloadSize > 10000) { // 10KB limit
        toast.error('Dados muito grandes', {
          description: 'Reduza a quantidade de dados históricos'
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('demand-forecast', {
        body: payload
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error("Erro na previsão", {
          description: data.error
        });
        return;
      }

      setForecast(data.forecast);
      toast.success(`Previsão gerada para "${sanitizedProductName}"`, {
        description: `Demanda estimada: ${data.forecast.previsao_proximos_30_dias} unidades/mês`
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error("Falha na análise", {
        description: "Não foi possível gerar a previsão. Tente novamente."
      });
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
              maxLength={100}
              className="mt-1"
            />
            {errors.productName && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.productName}
              </p>
            )}
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
                    max="999999"
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
