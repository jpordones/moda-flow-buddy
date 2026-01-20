import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RiskProductsCardProps {
  totalRiskProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  lowMarginCount: number;
}

export function RiskProductsCard({
  totalRiskProducts,
  outOfStockCount,
  lowStockCount,
  lowMarginCount,
}: RiskProductsCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-warning/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Produtos em Risco
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-warning">
            {totalRiskProducts}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-danger/5 rounded">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-danger" />
                <span className="text-xs">Sem estoque</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                {outOfStockCount}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-2 bg-warning/5 rounded">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span className="text-xs">Estoque baixo</span>
              </div>
              <Badge variant="warning" className="text-xs">
                {lowStockCount}
              </Badge>
            </div>

            <div className="flex justify-between items-center p-2 bg-orange-500/5 rounded">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-xs">Margem {"<"} 20%</span>
              </div>
              <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                {lowMarginCount}
              </Badge>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => navigate('/produtos')}
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Ver Todos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
