import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";

interface InventoryValueCardProps {
  inventoryValue: number;
  fastMovingValue: number;
  slowMovingValue: number;
}

export function InventoryValueCard({
  inventoryValue,
  fastMovingValue,
  slowMovingValue,
}: InventoryValueCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Capital em Estoque
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold">
              {formatarMoeda(inventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dinheiro investido em produtos
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs p-2 bg-success/5 rounded">
              <span className="text-muted-foreground">Giro rápido (&lt;30d):</span>
              <span className="font-medium text-success">
                {formatarMoeda(fastMovingValue)}
              </span>
            </div>
            
            <div className="flex justify-between text-xs p-2 bg-warning/5 rounded">
              <span className="text-muted-foreground">Giro lento (+90d):</span>
              <span className="font-medium text-warning">
                {formatarMoeda(slowMovingValue)}
              </span>
            </div>
          </div>

          {slowMovingValue > 0 && (
            <div className="p-2 bg-primary/5 rounded">
              <p className="text-xs text-primary font-medium mb-1">
                💡 Oportunidade:
              </p>
              <p className="text-xs text-muted-foreground">
                Liquidar estoque parado libera {formatarMoeda(slowMovingValue)} para novos produtos
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
