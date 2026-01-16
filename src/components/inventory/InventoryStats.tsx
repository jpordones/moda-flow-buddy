import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, AlertTriangle, XCircle } from 'lucide-react';
import { InventoryStats as Stats } from '@/types/inventory';
import { formatarMoeda } from '@/lib/formatters';

interface InventoryStatsProps {
  stats: Stats;
}

export function InventoryStats({ stats }: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Itens
          </CardTitle>
          <div className="p-2 rounded-lg bg-info/10">
            <Package className="h-5 w-5 text-info" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{stats.totalItems}</div>
          <p className="text-sm text-muted-foreground">
            em {stats.totalProducts} produtos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valor do Estoque
          </CardTitle>
          <div className="p-2 rounded-lg bg-indigo/10">
            <DollarSign className="h-5 w-5 text-indigo" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{formatarMoeda(stats.totalValue)}</div>
          <p className="text-sm text-muted-foreground">
            valor de venda
          </p>
        </CardContent>
      </Card>

      <Card className={stats.lowStockCount > 0 ? 'border-warning' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Estoque Baixo
          </CardTitle>
          <div className="p-2 rounded-lg bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl md:text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-warning' : ''}`}>
            {stats.lowStockCount}
          </div>
          <p className="text-sm text-muted-foreground">
            itens precisam de reposição
          </p>
        </CardContent>
      </Card>

      <Card className={stats.outOfStockCount > 0 ? 'border-danger' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sem Estoque
          </CardTitle>
          <div className="p-2 rounded-lg bg-danger/10">
            <XCircle className="h-5 w-5 text-danger" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl md:text-3xl font-bold ${stats.outOfStockCount > 0 ? 'text-danger' : ''}`}>
            {stats.outOfStockCount}
          </div>
          <p className="text-sm text-muted-foreground">
            itens esgotados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
