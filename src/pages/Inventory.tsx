import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Search, History, Loader2, Package, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useInventory } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { ExpandableProductCard } from "@/components/inventory/ExpandableProductCard";
import { StockEntryDialog } from "@/components/inventory/StockEntryDialog";
import { StockExitDialog } from "@/components/inventory/StockExitDialog";
import { StockHistoryDialog } from "@/components/inventory/StockHistoryDialog";
import { DemandForecastDialog } from "@/components/inventory/DemandForecastDialog";
import { InventoryItem } from "@/types/inventory";
import { defaultCategories, Product } from "@/types/products";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusRef = useRef<HTMLDivElement>(null);
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  const { 
    productsWithInventory, 
    movements,
    stats, 
    isLoading,
    addStockEntry,
    addStockExit,
    getItemStockStatus,
    fetchMovements,
    fetchInventory,
  } = useInventory();
  
  const { products } = useProducts();

  // Auto-focus product from query params
  useEffect(() => {
    const focusId = searchParams.get("focus");
    if (!focusId || !productsWithInventory?.length) return;

    const exists = productsWithInventory.some(x => x.id === focusId);
    if (!exists) return;

    setFocusedProductId(focusId);
    searchParams.delete("focus");
    setSearchParams(searchParams, { replace: true });
    setTimeout(() => setFocusedProductId(null), 3000);
  }, [productsWithInventory, searchParams, setSearchParams]);

  useEffect(() => {
    if (focusedProductId && focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedProductId]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showForecastDialog, setShowForecastDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>();
  const [forecastProduct, setForecastProduct] = useState<Product | null>(null);

  const filteredProducts = productsWithInventory.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    
    let matchesStock = true;
    if (filterStock === "critico") {
      matchesStock = p.stockStatus === 'critico';
    } else if (filterStock === "baixo") {
      matchesStock = p.stockStatus === 'baixo';
    } else if (filterStock === "normal") {
      matchesStock = p.stockStatus === 'normal' || p.stockStatus === 'alto';
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Handlers
  const handleStockEntry = async (data: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    const product = products.find(p => p.id === data.productId);
    const success = await addStockEntry(data);
    if (success) {
      toast.success("Entrada registrada", {
        description: `+${data.quantity} un de ${product?.name || 'produto'} (${data.size}/${data.color})`
      });
    } else {
      toast.error("Erro ao registrar entrada");
    }
    return success;
  };

  const handleStockExit = async (data: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    const product = products.find(p => p.id === data.productId);
    const success = await addStockExit(data);
    if (success) {
      toast.success("Saída registrada", {
        description: `-${data.quantity} un de ${product?.name || 'produto'} (${data.size}/${data.color})`
      });
    } else {
      toast.error("Erro ao registrar saída", {
        description: "Verifique se há estoque suficiente"
      });
    }
    return success;
  };

  // Quick entry/exit handlers (no dialog)
  const handleQuickEntry = async (item: InventoryItem, quantity: number) => {
    const success = await addStockEntry({
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity,
      reason: 'Entrada rápida',
    });
    if (success) {
      toast.success(`+${quantity} unidade(s) adicionada(s)`);
    }
  };

  const handleQuickExit = async (item: InventoryItem, quantity: number) => {
    const success = await addStockExit({
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity,
      reason: 'Saída rápida',
    });
    if (success) {
      toast.success(`-${quantity} unidade(s) removida(s)`);
    }
  };

  const handleOpenEntry = (productId?: string, item?: InventoryItem) => {
    setSelectedProductId(productId);
    if (item) setSelectedItem(item);
    setShowEntryDialog(true);
  };

  const handleOpenExit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowExitDialog(true);
  };

  const handleViewHistory = async (productId: string) => {
    await fetchMovements(productId, 100);
    setSelectedProductId(productId);
    setShowHistoryDialog(true);
  };

  const handleViewAllHistory = async () => {
    await fetchMovements(undefined, 100);
    setSelectedProductId(undefined);
    setShowHistoryDialog(true);
  };

  const handleConfigureAlerts = (item: InventoryItem) => {
    toast.info("Em breve", {
      description: "Configuração de alertas será implementada em breve"
    });
  };

  const openForecastForProduct = (productId: string) => {
    const p = productsWithInventory.find(x => x.id === productId);
    if (!p) return;

    const productAsProductType: Product = {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      status: (p.status as any) ?? "ativo",
      variableCosts: [],
      fixedCostAllocation: 0,
      customMargin: undefined,
      salePrice: p.salePrice,
      costPrice: p.costPrice,
      priceHistory: [],
      quantity: p.totalStock,
      minStock: 0,
      maxStock: 0,
      unit: "un",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setForecastProduct(productAsProductType);
    setShowForecastDialog(true);
  };

  const selectedProductName = selectedProductId 
    ? products.find(p => p.id === selectedProductId)?.name 
    : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie quantidades e movimentações por variação
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => handleOpenEntry()} 
            className="flex-1 sm:flex-none gap-2 h-11"
            variant="action"
          >
            <Plus className="h-4 w-4" />
            Nova Entrada
          </Button>
          <Button 
            onClick={() => setShowExitDialog(true)} 
            variant="outline" 
            className="flex-1 sm:flex-none gap-2 h-11"
          >
            <Minus className="h-4 w-4" />
            Nova Saída
          </Button>
          <Button 
            onClick={handleViewAllHistory} 
            variant="outline" 
            className="flex-1 sm:flex-none gap-2 h-11"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <InventoryStats stats={stats} />

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos em Estoque</CardTitle>
              <CardDescription>
                {filteredProducts.length} produto(s) • Clique para expandir variações
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandAll(!expandAll)}
              className="gap-1 text-muted-foreground"
            >
              {expandAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Recolher
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expandir
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px] h-11">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {defaultCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger className="w-[150px] h-11">
                  <SelectValue placeholder="Estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto em estoque</h3>
            <p className="text-muted-foreground mb-4">
              {productsWithInventory.length === 0 
                ? "Adicione produtos e faça a primeira entrada de estoque"
                : "Tente ajustar os filtros de busca"
              }
            </p>
            {productsWithInventory.length === 0 && products.length > 0 && (
              <Button onClick={() => handleOpenEntry()} variant="action" className="h-11">
                <Plus className="h-4 w-4 mr-2" />
                Primeira Entrada
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => {
            const isFocused = product.id === focusedProductId;
            return (
              <div
                key={product.id}
                ref={isFocused ? focusRef : undefined}
                className={cn(
                  "transition-all duration-300",
                  isFocused && "ring-2 ring-primary/50 rounded-lg"
                )}
              >
                <ExpandableProductCard
                  product={product}
                  onEntry={handleOpenEntry}
                  onExit={handleOpenExit}
                  onQuickEntry={handleQuickEntry}
                  onQuickExit={handleQuickExit}
                  onViewHistory={handleViewHistory}
                  onConfigureAlerts={handleConfigureAlerts}
                  onForecast={openForecastForProduct}
                  getItemStockStatus={getItemStockStatus}
                  defaultExpanded={expandAll || isFocused}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <StockEntryDialog
        open={showEntryDialog}
        onOpenChange={setShowEntryDialog}
        products={products}
        onSubmit={handleStockEntry}
        preselectedProductId={selectedProductId}
      />

      <StockExitDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        productsWithInventory={productsWithInventory}
        onSubmit={handleStockExit}
        preselectedItem={selectedItem}
      />

      <StockHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        movements={movements}
        productName={selectedProductName}
      />

      <DemandForecastDialog
        open={showForecastDialog}
        onOpenChange={setShowForecastDialog}
        product={forecastProduct}
      />
    </div>
  );
}
