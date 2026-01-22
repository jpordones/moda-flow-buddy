import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Grid, List, Package, Edit, Copy, Trash2, Calculator, AlertTriangle, ArrowUpDown, Loader2, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useSubscription } from "@/hooks/useSubscription";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductStats } from "@/components/products/ProductStats";
import { StockMovementDialog } from "@/components/products/StockMovementDialog";
import { SmartPricingDialog } from "@/components/pricing/SmartPricingDialog";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Product, ProductFormData, defaultCategories } from "@/types/products";

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'price' | 'stock' | 'updated';
type SortOrder = 'asc' | 'desc';

export default function Products() {
  const navigate = useNavigate();
  const { 
    products, 
    stats, 
    isLoading,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    duplicateProduct,
    updateStock,
    getStockStatus 
  } = useProducts();
  
  const { currentPlan, isWithinLimit, getRemainingLimit } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [stockMovementProduct, setStockMovementProduct] = useState<Product | null>(null);
  const [smartPricingProduct, setSmartPricingProduct] = useState<Product | null>(null);
  const [showSmartPricing, setShowSmartPricing] = useState(false);

  // Plan limits
  const productLimit = currentPlan?.max_products ?? 5;
  const currentProductCount = stats.totalProducts;
  const isUnlimited = productLimit === -1;
  const remainingProducts = isUnlimited ? Infinity : getRemainingLimit('products', currentProductCount);
  const isAtLimit = !isUnlimited && remainingProducts <= 0;
  const isNearLimit = !isUnlimited && remainingProducts <= 2 && remainingProducts > 0;

  // Filter and sort products
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
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.salePrice - b.salePrice;
          break;
        case 'stock':
          comparison = a.quantity - b.quantity;
          break;
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleAddProduct = async (data: ProductFormData) => {
    if (!data.name || !data.category || !data.costPrice || !data.salePrice || !data.quantity) {
      toast.error("Campos obrigatórios", {
        description: "Preencha nome, categoria, custo, preço e quantidade"
      });
      return;
    }
    
    // Check product limit before adding
    if (isAtLimit) {
      setShowUpgradeModal(true);
      return;
    }
    
    const result = await addProduct(data);
    if (result) {
      setIsFormOpen(false);
      toast.success(`Produto cadastrado`, {
        description: `"${data.name}" adicionado ao catálogo`
      });
    } else {
      toast.error("Erro ao cadastrar", {
        description: "Não foi possível salvar o produto"
      });
    }
  };

  const handleEditProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    const result = await updateProduct(editingProduct.id, data);
    const productName = data.name || editingProduct.name;
    setEditingProduct(null);
    if (result) {
      toast.success(`Produto atualizado`, {
        description: `"${productName}" foi salvo com sucesso`
      });
    } else {
      toast.error("Erro ao atualizar", {
        description: "Não foi possível atualizar o produto"
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    const product = products.find(p => p.id === deleteProductId);
    const success = await deleteProduct(deleteProductId);
    setDeleteProductId(null);
    if (success) {
      toast.success(`Produto excluído`, {
        description: product ? `"${product.name}" removido do catálogo` : undefined
      });
    } else {
      toast.error("Erro ao excluir", {
        description: "Não foi possível remover o produto"
      });
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    // Check product limit before duplicating
    if (isAtLimit) {
      setShowUpgradeModal(true);
      return;
    }
    
    const product = products.find(p => p.id === id);
    const result = await duplicateProduct(id);
    if (result) {
      toast.success(`Produto duplicado`, {
        description: product ? `Cópia de "${product.name}" criada` : undefined
      });
    } else {
      toast.error("Erro ao duplicar", {
        description: "Não foi possível duplicar o produto"
      });
    }
  };

  const handleStockMovement = async (productId: string, quantity: number, type: 'entrada' | 'saida', reason: string) => {
    const product = products.find(p => p.id === productId);
    const success = await updateStock(productId, quantity, type, reason);
    if (success) {
      const action = type === 'entrada' ? 'adicionadas' : 'removidas';
      toast.success(`Estoque atualizado`, {
        description: product 
          ? `${quantity} unidades ${action} de "${product.name}"` 
          : `${quantity} unidades ${action}`
      });
    } else {
      toast.error("Erro no estoque", {
        description: "Não foi possível atualizar o estoque"
      });
    }
  };

  const handleCalculatePrice = (product: Product) => {
    // Navigate to costs page with product data
    navigate('/custos', { state: { product } });
  };

  const handleApplySmartPrice = async (productId: string, newPrice: number) => {
    const p = products.find(x => x.id === productId);
    const result = await updateProduct(productId, { salePrice: String(newPrice) });

    if (result) {
      toast.success("Preço aplicado", {
        description: p ? `Novo preço de "${p.name}": R$ ${newPrice.toFixed(2)}` : undefined,
      });
    } else {
      toast.error("Erro ao aplicar preço", {
        description: "Não foi possível atualizar o preço no momento.",
      });
    }
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

  const handleOpenAddForm = () => {
    if (isAtLimit) {
      setShowUpgradeModal(true);
      return;
    }
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produtos</h1>
            {!isUnlimited && (
              <Badge 
                variant={isAtLimit ? "danger" : isNearLimit ? "warning" : "secondary"}
                className="text-xs"
              >
                {currentProductCount}/{productLimit}
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie seu catálogo de produtos</p>
        </div>
        <Button onClick={handleOpenAddForm} className="gap-2 h-11 w-full sm:w-auto" variant="action">
          {isAtLimit ? <Crown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAtLimit ? "Fazer Upgrade" : "Novo Produto"}
        </Button>
      </div>

      {/* Stats */}
      <ProductStats stats={stats} />

      {/* Filters and Actions - Responsive */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search and Filters - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 text-base"
                />
              </div>
              
              {/* Filters - Horizontal scroll on mobile */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[140px] sm:w-[160px] h-11 flex-shrink-0">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {defaultCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px] sm:w-[130px] h-11 flex-shrink-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                    <SelectItem value="descontinuado">Descontinuados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStock} onValueChange={setFilterStock}>
                  <SelectTrigger className="w-[130px] sm:w-[150px] h-11 flex-shrink-0">
                    <SelectValue placeholder="Estoque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="critico">Sem estoque</SelectItem>
                    <SelectItem value="baixo">Estoque baixo</SelectItem>
                    <SelectItem value="normal">Estoque normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* View mode toggle */}
            <div className="flex justify-end">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="grid" className="gap-1 px-3">
                    <Grid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-1 px-3">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {products.length === 0 
                  ? "Comece adicionando seu primeiro produto"
                  : "Tente ajustar os filtros de busca"
                }
              </p>
              {products.length === 0 && (
                <Button onClick={() => setIsFormOpen(true)} variant="action" className="h-11 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stockStatus={getStockStatus(product)}
                  onEdit={() => setEditingProduct(product)}
                  onDuplicate={() => handleDuplicateProduct(product.id)}
                  onDelete={() => setDeleteProductId(product.id)}
                  onCalculatePrice={() => handleCalculatePrice(product)}
                  onSmartPricing={() => {
                    setSmartPricingProduct(product);
                    setShowSmartPricing(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">SKU</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
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
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(product.status) as any}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {product.costPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {product.salePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant={getStockBadgeVariant(stockStatus.status) as any}>
                              {product.quantity} {product.unit}
                            </Badge>
                            {(stockStatus.status === 'critico' || stockStatus.status === 'baixo') && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingProduct(product)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSmartPricingProduct(product);
                                setShowSmartPricing(true);
                              }}
                              title="Preço inteligente"
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDuplicateProduct(product.id)}
                              title="Duplicar"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-danger/10 hover:text-danger"
                              onClick={() => setDeleteProductId(product.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
              
              {/* Mobile Card View for Table Mode */}
              <div className="md:hidden space-y-3">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <Card key={product.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(product.status) as any} className="text-xs">
                          {product.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-muted-foreground">{product.category}</span>
                        <span className="font-bold">R$ {product.salePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant={getStockBadgeVariant(stockStatus.status) as any} className="text-xs">
                          {product.quantity} {product.unit}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditingProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-danger" onClick={() => setDeleteProductId(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Produto</DialogTitle>
            <DialogDescription>Preencha as informações do produto</DialogDescription>
          </DialogHeader>
          <ProductForm 
            onSubmit={handleAddProduct} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>{editingProduct?.name}</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm 
              initialData={editingProduct}
              onSubmit={handleEditProduct} 
              onCancel={() => setEditingProduct(null)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="w-full sm:w-auto bg-danger hover:bg-danger/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stock Movement Dialog */}
      <StockMovementDialog
        product={stockMovementProduct}
        open={!!stockMovementProduct}
        onOpenChange={(open) => !open && setStockMovementProduct(null)}
        onSubmit={handleStockMovement}
      />

      {/* Smart Pricing Dialog */}
      <SmartPricingDialog
        open={showSmartPricing}
        onOpenChange={setShowSmartPricing}
        product={smartPricingProduct}
        onApplyPrice={handleApplySmartPrice}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={`Limite de ${productLimit} produtos`}
        requiredPlan={currentPlan?.plan_type === 'free' ? 'starter' : 'professional'}
        currentPlan={currentPlan?.plan_type}
      />
    </div>
  );
}
