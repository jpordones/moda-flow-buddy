import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  ChevronUp,
  Plus, 
  Minus, 
  MoreVertical, 
  History, 
  Bell, 
  Package, 
  TrendingUp,
  Edit,
  Barcode
} from "lucide-react";
import { ProductWithInventory, InventoryItem } from "@/types/inventory";
import { getVariantDisplayNameFromOptions } from "@/types/productEditor";
import { formatarMoeda } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ExpandableProductCardProps {
  product: ProductWithInventory;
  onEntry: (productId: string, item?: InventoryItem) => void;
  onExit: (item: InventoryItem) => void;
  onQuickEntry: (item: InventoryItem, quantity: number) => void;
  onQuickExit: (item: InventoryItem, quantity: number) => void;
  onViewHistory: (productId: string) => void;
  onConfigureAlerts: (item: InventoryItem) => void;
  onForecast: (productId: string) => void;
  getItemStockStatus: (item: InventoryItem) => { status: string; label: string; variant: string };
  defaultExpanded?: boolean;
}

export function ExpandableProductCard({
  product,
  onEntry,
  onExit,
  onQuickEntry,
  onQuickExit,
  onViewHistory,
  onConfigureAlerts,
  onForecast,
  getItemStockStatus,
  defaultExpanded = false,
}: ExpandableProductCardProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [quickQuantities, setQuickQuantities] = useState<Record<string, string>>({});

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case 'critico': return 'danger';
      case 'baixo': return 'warning';
      case 'alto': return 'success';
      default: return 'info';
    }
  };

  const handleQuickEntry = (item: InventoryItem) => {
    const qty = parseInt(quickQuantities[item.id] || '1');
    if (qty > 0) {
      onQuickEntry(item, qty);
      setQuickQuantities(prev => ({ ...prev, [item.id]: '' }));
    }
  };

  const handleQuickExit = (item: InventoryItem) => {
    const qty = parseInt(quickQuantities[item.id] || '1');
    if (qty > 0 && qty <= item.quantity) {
      onQuickExit(item, qty);
      setQuickQuantities(prev => ({ ...prev, [item.id]: '' }));
    }
  };

  const hasVariations = product.inventoryItems.length > 1 || 
    product.inventoryItems.some(i => 
      Object.keys(i.variantOptions).length > 0 ||
      (i.size && i.size !== 'Único') || (i.color && i.color !== 'Padrão')
    );

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                    {hasVariations && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {product.inventoryItems.length} variações
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-2xl font-bold">{product.totalStock}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatarMoeda(product.totalValue)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStockBadgeVariant(product.stockStatus) as any} className="hidden sm:flex">
                    {product.stockStatus === 'critico' ? 'Crítico' : 
                     product.stockStatus === 'baixo' ? 'Baixo' :
                     product.stockStatus === 'alto' ? 'Alto' : 'Normal'}
                  </Badge>
                  
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile stats */}
            <div className="flex items-center gap-2 mt-2 sm:hidden">
              <Badge variant={getStockBadgeVariant(product.stockStatus) as any}>
                {product.stockStatus === 'critico' ? 'Crítico' : 
                 product.stockStatus === 'baixo' ? 'Baixo' :
                 product.stockStatus === 'alto' ? 'Alto' : 'Normal'}
              </Badge>
              <span className="text-sm font-medium">{product.totalStock} un</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{formatarMoeda(product.totalValue)}</span>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            {/* Quick actions bar */}
            <div className="flex flex-wrap items-center gap-2 py-3 border-b mb-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEntry(product.id)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Entrada
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onViewHistory(product.id)}
                className="gap-1"
              >
                <History className="h-4 w-4" />
                Histórico
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onForecast(product.id)}
                className="gap-1"
              >
                <TrendingUp className="h-4 w-4" />
                Previsão
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => navigate(`/app/produtos/${product.id}/editar`)}
                className="gap-1 ml-auto"
              >
                <Edit className="h-4 w-4" />
                Editar Produto
              </Button>
            </div>
            
            {/* Variations table - Desktop */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b">
                    <th className="pb-2 font-medium">Variação</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium text-center">Estoque</th>
                    <th className="pb-2 font-medium text-center">Status</th>
                    <th className="pb-2 font-medium text-center">Ação Rápida</th>
                    <th className="pb-2 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {product.inventoryItems.map(item => {
                    const stockStatus = getItemStockStatus(item);
                    // Use variant_options for display, fallback to legacy
                    const displayLabel = Object.keys(item.variantOptions).length > 0
                      ? getVariantDisplayNameFromOptions(item.variantOptions)
                      : hasVariations 
                        ? `${item.size !== 'Único' ? item.size : ''} ${item.color !== 'Padrão' ? item.color : ''}`.trim() || 'Padrão'
                        : 'Produto único';
                    
                    return (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {hasVariations && (
                              <div className="flex flex-wrap gap-1">
                                {Object.keys(item.variantOptions).length > 0 ? (
                                  Object.entries(item.variantOptions).map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="text-xs">
                                      {value}
                                    </Badge>
                                  ))
                                ) : (
                                  <>
                                    {item.size !== 'Único' && (
                                      <Badge variant="secondary" className="text-xs">{item.size}</Badge>
                                    )}
                                    {item.color !== 'Padrão' && (
                                      <Badge variant="outline" className="text-xs">{item.color}</Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                            {!hasVariations && (
                              <span className="text-sm text-muted-foreground">Produto único</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-mono text-muted-foreground">
                            {(item as any).variant_sku || '-'}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={cn(
                            "text-lg font-bold",
                            stockStatus.status === 'critico' && "text-danger",
                            stockStatus.status === 'baixo' && "text-warning"
                          )}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={stockStatus.variant as any} className="text-xs">
                            {stockStatus.label}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => handleQuickExit(item)}
                              disabled={item.quantity === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.quantity}
                              placeholder="1"
                              value={quickQuantities[item.id] || ''}
                              onChange={(e) => setQuickQuantities(prev => ({ 
                                ...prev, 
                                [item.id]: e.target.value 
                              }))}
                              className="w-16 h-8 text-center"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => handleQuickEntry(item)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEntry(product.id, item)}>
                                <Plus className="h-4 w-4 mr-2 text-success" />
                                Entrada Detalhada
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onExit(item)}
                                disabled={item.quantity === 0}
                              >
                                <Minus className="h-4 w-4 mr-2 text-danger" />
                                Saída Detalhada
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onConfigureAlerts(item)}>
                                <Bell className="h-4 w-4 mr-2" />
                                Configurar Alertas
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Variations cards - Mobile */}
            <div className="md:hidden space-y-3">
              {product.inventoryItems.map(item => {
                const stockStatus = getItemStockStatus(item);
                
                return (
                  <div 
                    key={item.id} 
                    className={cn(
                      "p-4 rounded-lg border",
                      stockStatus.status === 'critico' && "border-danger bg-danger/5",
                      stockStatus.status === 'baixo' && "border-warning bg-warning/5",
                      stockStatus.status === 'normal' && "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {Object.keys(item.variantOptions).length > 0 ? (
                            Object.entries(item.variantOptions).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {value}
                              </Badge>
                            ))
                          ) : (
                            <>
                              {item.size !== 'Único' && (
                                <Badge variant="secondary" className="text-xs">{item.size}</Badge>
                              )}
                              {item.color !== 'Padrão' && (
                                <Badge variant="outline" className="text-xs">{item.color}</Badge>
                              )}
                              {item.size === 'Único' && item.color === 'Padrão' && (
                                <span className="text-sm text-muted-foreground">Produto único</span>
                              )}
                            </>
                          )}
                        </div>
                        {(item as any).variant_sku && (
                          <p className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                            <Barcode className="h-3 w-3" />
                            {(item as any).variant_sku}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-2xl font-bold",
                          stockStatus.status === 'critico' && "text-danger",
                          stockStatus.status === 'baixo' && "text-warning"
                        )}>
                          {item.quantity}
                        </div>
                        <Badge variant={stockStatus.variant as any} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Quick actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1"
                        onClick={() => handleQuickExit(item)}
                        disabled={item.quantity === 0}
                      >
                        <Minus className="h-4 w-4" />
                        Saída
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={quickQuantities[item.id] || ''}
                        onChange={(e) => setQuickQuantities(prev => ({ 
                          ...prev, 
                          [item.id]: e.target.value 
                        }))}
                        className="w-16 h-9 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1"
                        onClick={() => handleQuickEntry(item)}
                      >
                        <Plus className="h-4 w-4" />
                        Entrada
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Add variation button */}
            {hasVariations && (
              <button
                onClick={() => onEntry(product.id)}
                className="mt-4 w-full p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Adicionar nova variação
              </button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
