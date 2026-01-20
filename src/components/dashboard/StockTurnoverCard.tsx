import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCw } from "lucide-react";

interface SlowMovingProduct {
  name: string;
  daysInStock: number;
}

interface StockTurnoverCardProps {
  stockTurnover: number;
  slowMovingProducts: SlowMovingProduct[];
}

export function StockTurnoverCard({
  stockTurnover,
  slowMovingProducts,
}: StockTurnoverCardProps) {
  const daysToTurnover = stockTurnover > 0 ? Math.round(30 / stockTurnover) : 30;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Giro de Estoque
          </CardTitle>
          <RotateCw className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold">
              {stockTurnover.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">
              Estoque gira a cada {daysToTurnover} dias
            </p>
          </div>

          <div className="p-2 bg-muted/50 rounded text-xs">
            <p className="text-muted-foreground mb-1">Ideal para moda:</p>
            <p className="font-medium">4-6x por mês (giro a cada 5-7 dias)</p>
          </div>

          {slowMovingProducts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">🐌 Estoque Parado (+90 dias):</p>
              {slowMovingProducts.slice(0, 2).map((product, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded text-xs">
                  <span className="truncate flex-1 mr-2">{product.name}</span>
                  <span className="text-warning font-medium">{product.daysInStock}d</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
