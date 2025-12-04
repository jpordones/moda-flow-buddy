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
import { Plus, Search, Grid, List, Package, Edit, Copy, Trash2, Calculator, AlertTriangle, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductStats } from "@/components/products/ProductStats";
import { StockMovementDialog } from "@/components/products/StockMovementDialog";
import { Product, ProductFormData, defaultCategories } from "@/types/products";

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'price' | 'stock' | 'updated';
type SortOrder = 'asc' | 'desc';

export default function Products() {
  const navigate = useNavigate();
  const { 
    products, 
    stats, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    duplicateProduct,
    updateStock,
    getStockStatus 
  } = useProducts();

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

  const handleAddProduct = (data: ProductFormData) => {
    if (!data.name || !data.category || !data.costPrice || !data.salePrice || !data.quantity) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    addProduct(data);
    setIsFormOpen(false);
    toast.success("Produto cadastrado com sucesso!");
  };

  const handleEditProduct = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    toast.success("Produto atualizado!");
  };

  const handleDeleteProduct = () => {
    if (!deleteProductId) return;
    deleteProduct(deleteProductId);
    setDeleteProductId(null);
    toast.success("Produto excluído");
  };

  const handleDuplicateProduct = (id: string) => {
    duplicateProduct(id);
    toast.success("Produto duplicado!");
  };

  const handleStockMovement = (productId: string, quantity: number, type: 'entrada' | 'saida', reason: string) => {
    const success = updateStock(productId, quantity, type, reason);
    if (success) {
      toast.success(`Estoque ${type === 'entrada' ? 'adicionado' : 'removido'} com sucesso!`);
    } else {
      toast.error("Erro ao movimentar estoque");
    }
  };

  const handleCalculatePrice = (product: Product) => {
    // Navigate to costs page with product data
    navigate('/custos', { state: { product } });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2" variant="action">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <ProductStats stats={stats} />

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
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
                <SelectTrigger className="w-[130px]">
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
                <SelectTrigger className="w-[150px]">
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
            <div className="flex gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="grid" className="gap-1">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-1">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
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
                <Button onClick={() => setIsFormOpen(true)} variant="action">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stockStatus={getStockStatus(product)}
                  onEdit={() => setEditingProduct(product)}
                  onDuplicate={() => handleDuplicateProduct(product.id)}
                  onDelete={() => setDeleteProductId(product.id)}
                  onCalculatePrice={() => handleCalculatePrice(product)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
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
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDuplicateProduct(product.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-danger/10 hover:text-danger"
                              onClick={() => setDeleteProductId(product.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-danger hover:bg-danger/90">
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
    </div>
  );
}
