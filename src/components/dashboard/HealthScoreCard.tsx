import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  healthScore: number;
  liquidityScore: number;
  marginScore: number;
  stockScore: number;
  onViewProblems?: () => void;
}

export function HealthScoreCard({
  healthScore,
  liquidityScore,
  marginScore,
  stockScore,
  onViewProblems,
}: HealthScoreCardProps) {
  const getHealthStatus = () => {
    if (healthScore >= 80) return { label: "Ótima", variant: "success" as const };
    if (healthScore >= 60) return { label: "Atenção", variant: "warning" as const };
    return { label: "Crítica", variant: "destructive" as const };
  };

  const status = getHealthStatus();

  return (
    <Card className={cn(
      "relative overflow-hidden",
      healthScore >= 80 ? "border-success/50" : healthScore >= 60 ? "border-warning/50" : "border-danger/50"
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Activity className="w-full h-full" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Saúde Financeira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold mb-1">
              {healthScore}%
            </div>
            <div className="flex items-center gap-2">
              <Progress value={healthScore} className="h-2 w-24" />
              <Badge variant={status.variant}>
                {status.label}
              </Badge>
            </div>
          </div>
          <TrendingUp className={cn(
            "h-8 w-8",
            healthScore >= 80 ? "text-success" : "text-warning"
          )} />
        </div>
        
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Liquidez:</span>
            <span className="font-medium">{liquidityScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Margem Média:</span>
            <span className="font-medium">{marginScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estoque:</span>
            <span className="font-medium">{stockScore}%</span>
          </div>
        </div>

        {healthScore < 80 && onViewProblems && (
          <Button variant="outline" size="sm" className="w-full mt-3" onClick={onViewProblems}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            Ver Problemas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
