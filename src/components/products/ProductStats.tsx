import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";

interface ProductStatsProps {
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalStock: number;
    totalValue: number;
    totalCost: number;
    potentialProfit: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

export function ProductStats({ stats }: ProductStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
          <div className="p-2 rounded-lg bg-info/10">
            <Package className="h-5 w-5 text-info" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.activeProducts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalProducts - stats.activeProducts} inativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Valor do Estoque</CardTitle>
          <div className="p-2 rounded-lg bg-success/10">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatarMoeda(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalStock} unidades em estoque
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Potencial</CardTitle>
          <div className="p-2 rounded-lg bg-brand/20">
            <TrendingUp className="h-5 w-5 text-brand-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success">
            {formatarMoeda(stats.potentialProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            Custo total: {formatarMoeda(stats.totalCost)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Alertas de Estoque</CardTitle>
          <div className="p-2 rounded-lg bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-warning">{stats.lowStockCount + stats.outOfStockCount}</div>
          <p className="text-xs text-muted-foreground">
            {stats.outOfStockCount} sem estoque, {stats.lowStockCount} baixo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
