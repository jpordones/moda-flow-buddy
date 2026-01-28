import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingDown, ArrowRight } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";

interface CostsOverviewCardProps {
  totalFixedCosts: number;
  totalVariableCosts: number;
  averageCostPerUnit: number;
  monthlyVolume: number;
}

export function CostsOverviewCard({
  totalFixedCosts,
  totalVariableCosts,
  averageCostPerUnit,
  monthlyVolume,
}: CostsOverviewCardProps) {
  const navigate = useNavigate();
  const totalMonthlyCosts = totalFixedCosts + (totalVariableCosts * monthlyVolume);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Resumo de Custos
          </CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold">
              {formatarMoeda(totalMonthlyCosts)}
            </div>
            <p className="text-xs text-muted-foreground">
              Custos mensais estimados
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Custos Fixos:
              </span>
              <span className="font-medium">
                {formatarMoeda(totalFixedCosts)}
              </span>
            </div>
            
            <div className="flex justify-between text-xs p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Custo médio/un:</span>
              <span className="font-medium">
                {formatarMoeda(averageCostPerUnit)}
              </span>
            </div>

            <div className="flex justify-between text-xs p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Volume estimado:</span>
              <span className="font-medium">
                {monthlyVolume} un/mês
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/app/custos')}
          >
            Gerenciar Custos
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
