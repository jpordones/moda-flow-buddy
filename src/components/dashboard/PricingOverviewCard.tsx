import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, TrendingUp, ArrowRight, AlertTriangle } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";

interface PricingOverviewCardProps {
  averageMargin: number;
  averageSalePrice: number;
  averageCostPrice: number;
  productsNeedingReview: number;
  totalProducts: number;
}

export function PricingOverviewCard({
  averageMargin,
  averageSalePrice,
  averageCostPrice,
  productsNeedingReview,
  totalProducts,
}: PricingOverviewCardProps) {
  const navigate = useNavigate();
  
  const marginStatus = averageMargin >= 30 
    ? { label: "Saudável", variant: "success" as const }
    : averageMargin >= 15 
    ? { label: "Atenção", variant: "warning" as const }
    : { label: "Crítica", variant: "destructive" as const };

  const averageProfit = averageSalePrice - averageCostPrice;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Visão de Precificação
          </CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">
                {averageMargin.toFixed(1)}%
              </div>
              <Badge variant={marginStatus.variant}>
                {marginStatus.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Margem média do catálogo
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Preço médio:</span>
              <span className="font-medium">
                {formatarMoeda(averageSalePrice)}
              </span>
            </div>
            
            <div className="flex justify-between text-xs p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Custo médio:</span>
              <span className="font-medium">
                {formatarMoeda(averageCostPrice)}
              </span>
            </div>

            <div className="flex justify-between text-xs p-2 bg-success/5 rounded">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                Lucro médio:
              </span>
              <span className="font-medium text-success">
                {formatarMoeda(averageProfit)}
              </span>
            </div>
          </div>

          {productsNeedingReview > 0 && (
            <div className="p-2 bg-warning/5 rounded border border-warning/20">
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="h-3 w-3 text-warning" />
                <span className="text-warning font-medium">
                  {productsNeedingReview} produto(s) precisam de revisão de preço
                </span>
              </div>
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/app/precificacao')}
          >
            Analisar Precificação
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
