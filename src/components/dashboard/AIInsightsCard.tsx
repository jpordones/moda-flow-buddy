import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Package, Lightbulb } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";

interface RestockSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedQuantity: number;
}

interface AIInsightsCardProps {
  predictedRevenue: number;
  revenueGoal: number;
  restockSuggestions: RestockSuggestion[];
  slowMovingValue: number;
}

export function AIInsightsCard({
  predictedRevenue,
  revenueGoal,
  restockSuggestions,
  slowMovingValue,
}: AIInsightsCardProps) {
  const navigate = useNavigate();
  const willMeetGoal = predictedRevenue >= revenueGoal;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Insights e Recomendações com IA
        </CardTitle>
        <CardDescription>
          Análise preditiva baseada no seu histórico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Previsão de Faturamento */}
        <div className="p-4 bg-background rounded-lg border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-1">Previsão de Faturamento</p>
              <p className="text-sm text-muted-foreground mb-2">
                Com base no histórico dos últimos 3 meses, você deve faturar aproximadamente:
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-success">
                  {formatarMoeda(predictedRevenue)}
                </span>
                <span className="text-sm text-muted-foreground">
                  nos próximos 30 dias
                </span>
              </div>
              {willMeetGoal ? (
                <Badge variant="success" className="mt-2">
                  ✓ Dentro da meta
                </Badge>
              ) : (
                <Badge variant="warning" className="mt-2">
                  ⚠️ {formatarMoeda(revenueGoal - predictedRevenue)} abaixo da meta
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Recomendação de Reposição */}
        {restockSuggestions.length > 0 && (
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Package className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Reposição Sugerida</p>
                <p className="text-sm text-muted-foreground mb-3">
                  {restockSuggestions.length} produto(s) precisam de reposição nos próximos 15 dias:
                </p>
                <div className="space-y-2">
                  {restockSuggestions.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="truncate flex-1 mr-2">{item.productName}</span>
                      <Badge variant="outline">
                        +{item.suggestedQuantity} unidades
                      </Badge>
                    </div>
                  ))}
                </div>
                {restockSuggestions.length > 3 && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2" 
                    onClick={() => navigate('/estoque')}
                  >
                    Ver todos ({restockSuggestions.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Oportunidade de Otimização */}
        {slowMovingValue > 0 && (
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">💡 Oportunidade Detectada</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Você tem {formatarMoeda(slowMovingValue)} em produtos parados há mais de 90 dias. 
                  Considere criar promoções para liberar capital.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Impacto potencial:</span>
                  <span className="font-bold text-success">
                    +{formatarMoeda(slowMovingValue * 0.7)} em caixa
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => navigate('/produtos')}
                >
                  Ver Produtos Parados
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
