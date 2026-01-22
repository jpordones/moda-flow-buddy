import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Minus, MoreVertical, History, Bell, Package, TrendingUp } from 'lucide-react';
import { ProductWithInventory, InventoryItem } from '@/types/inventory';
import { formatarMoeda } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ProductInventoryCardProps {
  product: ProductWithInventory;
  onEntry: (productId: string) => void;
  onExit: (item: InventoryItem) => void;
  onViewHistory: (productId: string) => void;
  onConfigureAlerts: (item: InventoryItem) => void;
  onForecast: (productId: string) => void;
  getItemStockStatus: (item: InventoryItem) => { status: string; label: string; variant: string };
}

export function ProductInventoryCard({
  product,
  onEntry,
  onExit,
  onViewHistory,
  onConfigureAlerts,
  onForecast,
  getItemStockStatus,
}: ProductInventoryCardProps) {
  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case 'critico': return 'danger';
      case 'baixo': return 'warning';
      case 'alto': return 'success';
      default: return 'info';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription className="font-mono text-xs">{product.sku}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{product.totalStock}</div>
            <div className="text-sm text-muted-foreground">
              {formatarMoeda(product.totalValue)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={getStockBadgeVariant(product.stockStatus) as any}>
            {product.stockStatus === 'critico' ? 'Crítico' : 
             product.stockStatus === 'baixo' ? 'Baixo' :
             product.stockStatus === 'alto' ? 'Alto' : 'Normal'}
          </Badge>
          <Badge variant="outline">{product.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Inventory Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {product.inventoryItems.map(item => {
            const stockStatus = getItemStockStatus(item);
            return (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  stockStatus.status === 'critico' && "border-danger bg-danger/5",
                  stockStatus.status === 'baixo' && "border-warning bg-warning/5",
                  stockStatus.status === 'normal' && "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.size} / {item.color}
                    </div>
                    <div className={cn(
                      "text-xl font-bold mt-1",
                      stockStatus.status === 'critico' && "text-danger",
                      stockStatus.status === 'baixo' && "text-warning"
                    )}>
                      {item.quantity}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7 -mr-1 -mt-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEntry(product.id)}>
                        <Plus className="h-4 w-4 mr-2 text-success" />
                        Entrada Rápida
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onExit(item)}
                        disabled={item.quantity === 0}
                      >
                        <Minus className="h-4 w-4 mr-2 text-danger" />
                        Saída Rápida
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewHistory(product.id)}>
                        <History className="h-4 w-4 mr-2" />
                        Ver Histórico
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onConfigureAlerts(item)}>
                        <Bell className="h-4 w-4 mr-2" />
                        Configurar Alertas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onForecast(product.id)}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Previsão de demanda
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          
          {/* Add new variation button */}
          <button
            onClick={() => onEntry(product.id)}
            className="p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center min-h-[72px]"
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
