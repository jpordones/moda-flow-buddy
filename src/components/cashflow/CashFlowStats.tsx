import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Wallet, CreditCard } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CashFlowStats as Stats } from "@/hooks/useCashFlow";

interface CashFlowStatsProps {
  stats: Stats;
  isLoading?: boolean;
}

export function CashFlowStats({ stats, isLoading }: CashFlowStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Entradas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Entradas
          </CardTitle>
          <div className="p-2 rounded-lg bg-success/10">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-success">
            {formatarMoeda(stats.totalIncome)}
          </div>
          {stats.incomeTrend !== 0 && (
            <p className={cn(
              "text-xs mt-1",
              stats.incomeTrend > 0 ? "text-success" : "text-destructive"
            )}>
              {stats.incomeTrend > 0 ? '+' : ''}{stats.incomeTrend}% vs mês anterior
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total de Saídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Saídas
          </CardTitle>
          <div className="p-2 rounded-lg bg-destructive/10">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-destructive">
            {formatarMoeda(stats.totalExpenses)}
          </div>
          {stats.expensesTrend !== 0 && (
            <p className={cn(
              "text-xs mt-1",
              stats.expensesTrend < 0 ? "text-success" : "text-destructive"
            )}>
              {stats.expensesTrend > 0 ? '+' : ''}{stats.expensesTrend}% vs mês anterior
            </p>
          )}
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo Atual
          </CardTitle>
          <div className={cn(
            "p-2 rounded-lg",
            stats.balance >= 0 ? "bg-success/10" : "bg-destructive/10"
          )}>
            <Wallet className={cn(
              "h-5 w-5",
              stats.balance >= 0 ? "text-success" : "text-destructive"
            )} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl md:text-3xl font-bold",
            stats.balance >= 0 ? "text-success" : "text-destructive"
          )}>
            {formatarMoeda(stats.balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.balance >= 0 ? 'Positivo ✓' : 'Negativo ⚠️'}
          </p>
        </CardContent>
      </Card>

      {/* Projeção 30 dias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Projeção 30 dias
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl md:text-3xl font-bold",
            stats.projected30Days >= 0 ? "text-primary" : "text-destructive"
          )}>
            {formatarMoeda(stats.projected30Days)}
          </div>
          {stats.balance !== 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {stats.projected30Days > stats.balance ? '+' : ''}
              {((stats.projected30Days - stats.balance) / Math.abs(stats.balance) * 100).toFixed(0)}% projetado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
