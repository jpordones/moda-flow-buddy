import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Grid, List, Package, Edit, Copy, Trash2, Loader2, Crown, Sparkles, History, Minus, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useSubscription } from "@/hooks/useSubscription";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductStats } from "@/components/products/ProductStats";
import { StockMovementDialog } from "@/components/products/StockMovementDialog";
import { SmartPricingDialog } from "@/components/pricing/SmartPricingDialog";
import { UpgradeModal } from "@/components/UpgradeModal";
import { StockEntryDialog } from "@/components/inventory/StockEntryDialog";
import { StockExitDialog } from "@/components/inventory/StockExitDialog";
import { StockHistoryDialog } from "@/components/inventory/StockHistoryDialog";
import { DemandForecastDialog } from "@/components/inventory/DemandForecastDialog";
import { Product, defaultCategories } from "@/types/products";

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'price' | 'stock' | 'updated';
type SortOrder = 'asc' | 'desc';

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    products, 
    stats, 
    isLoading,
    deleteProduct, 
    duplicateProduct,
    updateStock,
    getStockStatus,
    updateProduct
  } = useProducts();
  
  const {
    productsWithInventory,
    movements,
    addStockEntry,
    addStockExit,
    fetchMovements,
  } = useInventory();
  
  const { currentPlan, getRemainingLimit } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [stockMovementProduct, setStockMovementProduct] = useState<Product | null>(null);
  const [smartPricingProduct, setSmartPricingProduct] = useState<Product | null>(null);
  const [showSmartPricing, setShowSmartPricing] = useState(false);

  // Inventory dialogs
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showForecastDialog, setShowForecastDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [forecastProduct, setForecastProduct] = useState<Product | null>(null);

  useEffect(() => {
    const id = searchParams.get("smartPricing");
    if (!id || !products?.length) return;
    const p = products.find(x => x.id === id);
    if (!p) return;
    setSmartPricingProduct(p);
    setShowSmartPricing(true);
    searchParams.delete("smartPricing");
    searchParams.delete("objective");
    setSearchParams(searchParams, { replace: true });
  }, [products, searchParams, setSearchParams]);

  const productLimit = currentPlan?.max_products ?? 5;
  const currentProductCount = stats.totalProducts;
  const isUnlimited = productLimit === -1;
  const remainingProducts = isUnlimited ? Infinity : getRemainingLimit('products', currentProductCount);
  const isAtLimit = !isUnlimited && remainingProducts <= 0;
  const isNearLimit = !isUnlimited && remainingProducts <= 2 && remainingProducts > 0;

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || p.category === filterCategory;
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      let matchesStock = true;
      if (filterStock === "baixo") {
        matchesStock = p.quantity <= p.minStock && p.quantity > 0;
      } else if (filterStock === "critico") {
        matchesStock = p.quantity === 0;
      } else if (filterStock === "normal") {
        matchesStock = p.quantity > p.minStock;
      }
      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'price': comparison = a.salePrice - b.salePrice; break;
        case 'stock': comparison = a.quantity - b.quantity; break;
        case 'updated': comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleOpenAddForm = () => {
    if (isAtLimit) { setShowUpgradeModal(true); return; }
    navigate('/app/produtos/novo');
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/app/produtos/${product.id}/editar`);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    const product = products.find(p => p.id === deleteProductId);
    const success = await deleteProduct(deleteProductId);
    setDeleteProductId(null);
    if (success) {
      toast.success(`Produto excluído`, { description: product ? `"${product.name}" removido` : undefined });
    } else {
      toast.error("Erro ao excluir");
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    if (isAtLimit) { setShowUpgradeModal(true); return; }
    const result = await duplicateProduct(id);
    if (result) toast.success(`Produto duplicado`);
  };

  const handleStockMovement = async (productId: string, quantity: number, type: 'entrada' | 'saida', reason: string) => {
    const success = await updateStock(productId, quantity, type, reason);
    if (success) toast.success(`Estoque atualizado`);
  };

  const handleApplySmartPrice = async (productId: string, newPrice: number) => {
    const result = await updateProduct(productId, { salePrice: String(newPrice) });
    if (result) toast.success("Preço aplicado");
  };

  // Inventory handlers
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
        description: `+${data.quantity} un de ${product?.name || 'produto'}`
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
        description: `-${data.quantity} un de ${product?.name || 'produto'}`
      });
    } else {
      toast.error("Erro ao registrar saída", {
        description: "Verifique se há estoque suficiente"
      });
    }
    return success;
  };

  const handleOpenEntry = (productId?: string) => {
    setSelectedProductId(productId);
    setShowEntryDialog(true);
  };

  const handleOpenExit = (productId?: string) => {
    setSelectedProductId(productId);
    setShowExitDialog(true);
  };

  const handleViewHistory = async (productId?: string) => {
    await fetchMovements(productId, 100);
    setSelectedProductId(productId);
    setShowHistoryDialog(true);
  };

  const handleOpenForecast = (product: Product) => {
    setForecastProduct(product);
    setShowForecastDialog(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'success';
      case 'inativo': return 'secondary';
      case 'descontinuado': return 'danger';
      default: return 'secondary';
    }
  };

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case 'critico': return 'danger';
      case 'baixo': return 'warning';
      case 'alto': return 'success';
      default: return 'info';
    }
  };

  const selectedProductName = selectedProductId 
    ? products.find(p => p.id === selectedProductId)?.name 
    : undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produtos</h1>
            {!isUnlimited && (
              <Badge variant={isAtLimit ? "danger" : isNearLimit ? "warning" : "secondary"} className="text-xs">
                {currentProductCount}/{productLimit}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Gerencie seu catálogo e estoque de produtos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleOpenAddForm} className="gap-2 h-11" variant="action">
            {isAtLimit ? <Crown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAtLimit ? "Fazer Upgrade" : "Novo Produto"}
          </Button>
          <Button onClick={() => handleOpenEntry()} variant="outline" className="gap-2 h-11">
            <Plus className="h-4 w-4" />
            Entrada
          </Button>
          <Button onClick={() => handleOpenExit()} variant="outline" className="gap-2 h-11">
            <Minus className="h-4 w-4" />
            Saída
          </Button>
          <Button onClick={() => handleViewHistory()} variant="ghost" className="gap-2 h-11">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>
        </div>
      </div>

      <ProductStats stats={stats} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[140px] h-11"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {defaultCategories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px] h-11"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStock} onValueChange={setFilterStock}>
                  <SelectTrigger className="w-[120px] h-11"><SelectValue placeholder="Estoque" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="grid" className="gap-1"><Grid className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="table" className="gap-1"><List className="h-4 w-4" /></TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <Button onClick={handleOpenAddForm} variant="action"><Plus className="h-4 w-4 mr-2" />Adicionar Produto</Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stockStatus={getStockStatus(product)}
                  onEdit={() => handleEditProduct(product)}
                  onDuplicate={() => handleDuplicateProduct(product.id)}
                  onDelete={() => setDeleteProductId(product.id)}
                  onCalculatePrice={() => navigate('/custos', { state: { product } })}
                  onSmartPricing={() => { setSmartPricingProduct(product); setShowSmartPricing(true); }}
                  onStockEntry={() => handleOpenEntry(product.id)}
                  onStockExit={() => handleOpenExit(product.id)}
                  onViewHistory={() => handleViewHistory(product.id)}
                  onForecast={() => handleOpenForecast(product)}
                />
              ))}
            </div>
          ) : (
            <div className="hidden md:block rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(product.status) as any}>{product.status}</Badge></TableCell>
                        <TableCell className="text-right">R$ {product.salePrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getStockBadgeVariant(stockStatus.status) as any}>{product.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditProduct(product)} title="Editar"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEntry(product.id)} title="Entrada"><Plus className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenExit(product.id)} title="Saída"><Minus className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSmartPricingProduct(product); setShowSmartPricing(true); }} title="Preço inteligente"><Sparkles className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicateProduct(product.id)} title="Duplicar"><Copy className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-danger" onClick={() => setDeleteProductId(product.id)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-danger hover:bg-danger/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StockMovementDialog product={stockMovementProduct} open={!!stockMovementProduct} onOpenChange={(open) => !open && setStockMovementProduct(null)} onSubmit={handleStockMovement} />
      <SmartPricingDialog open={showSmartPricing} onOpenChange={setShowSmartPricing} product={smartPricingProduct} onApplyPrice={handleApplySmartPrice} />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature={`Limite de ${productLimit} produtos`} requiredPlan={currentPlan?.plan_type === 'free' ? 'starter' : 'professional'} currentPlan={currentPlan?.plan_type} />
      
      {/* Inventory Dialogs */}
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
