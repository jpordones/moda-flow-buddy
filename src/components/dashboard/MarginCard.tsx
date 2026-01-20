import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Percent, TrendingUp, TrendingDown } from "lucide-react";

interface TopMarginProduct {
  name: string;
  margin: number;
}

interface MarginCardProps {
  averageMargin: number;
  marginTrend?: number;
  topMarginProducts: TopMarginProduct[];
}

export function MarginCard({
  averageMargin,
  marginTrend = 0,
  topMarginProducts,
}: MarginCardProps) {
  const isPositiveTrend = marginTrend >= 0;
  const progressValue = Math.min(100, (averageMargin / 40) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Margem de Lucro
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold">
              {averageMargin.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-sm">
              {isPositiveTrend ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger" />
              )}
              <span className={isPositiveTrend ? "text-success" : "text-danger"}>
                {isPositiveTrend ? "+" : ""}{marginTrend.toFixed(1)}% vs mês anterior
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Ideal para moda:</span>
              <span className="font-medium">30-40%</span>
            </div>
            <Progress 
              value={progressValue} 
              className="h-2"
            />
          </div>

          {topMarginProducts.length > 0 && (
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-xs font-medium mb-2">🏆 Top 3 Margens:</p>
              <div className="space-y-1 text-xs">
                {topMarginProducts.slice(0, 3).map((product, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate flex-1 mr-2">{product.name}</span>
                    <span className="text-success font-medium">{product.margin.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
