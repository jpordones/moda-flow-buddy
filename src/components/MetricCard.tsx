import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  variant?: "default" | "success" | "danger" | "warning" | "info" | "indigo";
}

export function MetricCard({ title, value, icon: Icon, trend, subtitle, variant = "default" }: MetricCardProps) {
  const iconVariantStyles = {
    default: "bg-primary/10 text-primary dark:bg-primary/20",
    success: "bg-success/10 text-success dark:bg-success/20",
    danger: "bg-danger/10 text-danger dark:bg-danger/20",
    warning: "bg-warning/10 text-warning dark:bg-warning/20",
    info: "bg-info/10 text-info dark:bg-info/20",
    indigo: "bg-indigo/10 text-indigo dark:bg-indigo/20",
  };

  return (
    <Card className="bg-card border border-border rounded-xl transition-all duration-200 hover:shadow-lg shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn(
          "p-3 rounded-xl",
          iconVariantStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-3xl md:text-4xl font-bold text-foreground">{value}</div>
        {(trend || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={cn(
                "text-sm font-semibold flex items-center gap-1",
                trend.positive ? "text-success" : "text-danger"
              )}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}