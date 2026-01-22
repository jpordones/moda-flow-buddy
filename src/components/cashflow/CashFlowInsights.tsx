import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowInsight } from "@/hooks/useCashFlow";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

interface CashFlowInsightsProps {
  insights: CashFlowInsight[];
}

export function CashFlowInsights({ insights }: CashFlowInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-primary" />
          Insights Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                insight.type === 'success' && "bg-success/10 border-l-4 border-success",
                insight.type === 'warning' && "bg-warning/10 border-l-4 border-warning",
                insight.type === 'danger' && "bg-destructive/10 border-l-4 border-destructive",
                insight.type === 'info' && "bg-primary/10 border-l-4 border-primary"
              )}
            >
              <span className="text-lg flex-shrink-0">{insight.icon}</span>
              <p className="text-sm text-foreground">{insight.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
