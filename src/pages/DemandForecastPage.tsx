import { DemandForecast } from "@/components/DemandForecast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";

export default function DemandForecastPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          Previsão de Demanda
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Análise preditiva com IA para otimizar seu estoque e vendas
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Algoritmos Avançados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Utilizamos Holt-Winters, Regressão Linear e Média Móvel para previsões precisas.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" />
              Insights em Linguagem Natural
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receba recomendações claras sobre quando e quanto repor cada produto.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Intervalos de Confiança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Previsões com 95% de confiança para tomada de decisão segura.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Forecast Component */}
      <DemandForecast />
    </div>
  );
}
