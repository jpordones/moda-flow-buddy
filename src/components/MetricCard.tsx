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
  variant?: "default" | "success" | "danger" | "warning" | "info" | "indigo";
}

export function MetricCard({ title, value, icon: Icon, trend, variant = "default" }: MetricCardProps) {
  const variantStyles = {
    default: "bg-card border",
    success: "bg-card border",
    danger: "bg-card border",
    warning: "bg-card border",
    info: "bg-card border",
    indigo: "bg-card border",
  };

  const iconVariantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success-light text-success",
    danger: "bg-danger-light text-danger",
    warning: "bg-warning-light text-warning",
    info: "bg-info-light text-info",
    indigo: "bg-indigo-light text-indigo",
  };

  return (
    <Card className={cn("shadow-sm transition-all hover:shadow-md rounded-xl", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", iconVariantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-4xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p className={cn("text-sm font-medium mt-1", trend.positive ? "text-success" : "text-danger")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
