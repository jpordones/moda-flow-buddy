import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Trash2, Calculator, Package } from "lucide-react";
import { Product } from "@/types/products";
import { formatarMoeda, formatarPorcentagem } from "@/lib/formatters";

interface ProductCardProps {
  product: Product;
  stockStatus: { status: string; label: string; color: string };
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCalculatePrice: () => void;
}

export function ProductCard({ 
  product, 
  stockStatus,
  onEdit, 
  onDuplicate, 
  onDelete,
  onCalculatePrice 
}: ProductCardProps) {
  const getStatusBadgeVariant = () => {
    switch (product.status) {
      case 'ativo': return 'success';
      case 'inativo': return 'secondary';
      case 'descontinuado': return 'danger';
      default: return 'secondary';
    }
  };

  const getStockBadgeVariant = () => {
    switch (stockStatus.status) {
      case 'critico': return 'danger';
      case 'baixo': return 'warning';
      case 'alto': return 'success';
      default: return 'info';
    }
  };

  const margin = product.costPrice > 0 
    ? ((product.salePrice - product.costPrice) / product.salePrice * 100).toFixed(0)
    : 0;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCalculatePrice}>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Preço
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant={getStatusBadgeVariant() as any} className="text-xs">
            {product.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Preço de Venda</span>
            <span className="font-bold text-lg">{formatarMoeda(product.salePrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Custo</span>
            <span className="text-sm">{formatarMoeda(product.costPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Margem</span>
            <span className="text-sm font-medium text-success">{formatarPorcentagem(margin, 0)}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant={getStockBadgeVariant() as any} className="text-xs">
              {stockStatus.label}
            </Badge>
          </div>
          <span className="text-sm font-medium">
            {product.quantity} {product.unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
