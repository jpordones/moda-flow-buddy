import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";

interface RevenueGoalCardProps {
  currentRevenue: number;
  revenueGoal: number;
  projectedRevenue: number;
}

export function RevenueGoalCard({
  currentRevenue,
  revenueGoal,
  projectedRevenue,
}: RevenueGoalCardProps) {
  const percentage = Math.min(100, (currentRevenue / revenueGoal) * 100);
  const remaining = Math.max(0, revenueGoal - currentRevenue);
  const willMeetGoal = projectedRevenue >= revenueGoal;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Faturamento Mensal
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-3xl font-bold">
              {formatarMoeda(currentRevenue)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Meta:</span>
              <span className="font-medium">{formatarMoeda(revenueGoal)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {percentage.toFixed(0)}% da meta
              </span>
              <span className="text-muted-foreground">
                Faltam {formatarMoeda(remaining)}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="p-2 bg-muted/50 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="font-medium">Projeção fim do mês:</span>
            </div>
            <span className="text-foreground font-semibold">
              {formatarMoeda(projectedRevenue)}
            </span>
            {willMeetGoal ? (
              <Badge variant="success" className="ml-2 text-xs">✓ Bate meta</Badge>
            ) : (
              <Badge variant="warning" className="ml-2 text-xs">⚠️ Abaixo da meta</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
