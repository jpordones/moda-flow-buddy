import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  MoreVertical, 
  Trash2, 
  Wand2,
  DollarSign,
  Package
} from "lucide-react";
import { ProductVariant, getVariantDisplayName } from "@/types/productEditor";
import { formatarMoeda } from "@/lib/formatters";
import { useIsMobile } from "@/hooks/use-mobile";

interface VariantsGridProps {
  variants: ProductVariant[];
  basePrice: number;
  baseSku: string;
  onUpdateVariant: (variantId: string, field: keyof ProductVariant, value: unknown) => void;
  onRemoveVariant: (variantId: string) => void;
  onBulkUpdate: (field: 'price' | 'quantity', value: number) => void;
}

export function VariantsGrid({
  variants,
  basePrice,
  baseSku,
  onUpdateVariant,
  onRemoveVariant,
  onBulkUpdate,
}: VariantsGridProps) {
  const isMobile = useIsMobile();
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkQuantity, setBulkQuantity] = useState<string>('');

  const handleApplyBulkPrice = () => {
    const value = parseFloat(bulkPrice);
    if (!isNaN(value)) {
      onBulkUpdate('price', value);
      setBulkPrice('');
    }
  };

  const handleApplyBulkQuantity = () => {
    const value = parseInt(bulkQuantity);
    if (!isNaN(value)) {
      onBulkUpdate('quantity', value);
      setBulkQuantity('');
    }
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Bulk actions for mobile */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <p className="text-sm font-medium">Aplicar para todas</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Preço"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="h-9"
                />
                <Button size="sm" variant="outline" onClick={handleApplyBulkPrice} className="h-9 px-2">
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Qtde"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  className="h-9"
                />
                <Button size="sm" variant="outline" onClick={handleApplyBulkQuantity} className="h-9 px-2">
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Variant cards */}
        <div className="space-y-3">
          {variants.map((variant) => (
            <Card key={variant.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{getVariantDisplayName(variant)}</p>
                  <p className="text-sm text-muted-foreground">
                    {baseSku ? `${baseSku}-${variant.sku}` : variant.sku || 'Sem SKU'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveVariant(variant.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">SKU</label>
                  <Input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => onUpdateVariant(variant.id, 'sku', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Código de barras</label>
                  <Input
                    placeholder="Código"
                    value={variant.barcode}
                    onChange={(e) => onUpdateVariant(variant.id, 'barcode', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Preço {variant.price === null && '(usa base)'}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={formatarMoeda(basePrice)}
                    value={variant.price ?? ''}
                    onChange={(e) => onUpdateVariant(
                      variant.id, 
                      'price', 
                      e.target.value ? parseFloat(e.target.value) : null
                    )}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Estoque</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={variant.quantity || ''}
                    onChange={(e) => onUpdateVariant(variant.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">Aplicar para todas:</span>
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            className="w-28 h-9"
          />
          <Button size="sm" variant="outline" onClick={handleApplyBulkPrice}>
            Aplicar
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            placeholder="Estoque"
            value={bulkQuantity}
            onChange={(e) => setBulkQuantity(e.target.value)}
            className="w-28 h-9"
          />
          <Button size="sm" variant="outline" onClick={handleApplyBulkQuantity}>
            Aplicar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variação</TableHead>
              <TableHead className="w-32">SKU</TableHead>
              <TableHead className="w-36">Código de barras</TableHead>
              <TableHead className="w-32">Preço</TableHead>
              <TableHead className="w-28">Estoque</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(variant.properties).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => onUpdateVariant(variant.id, 'sku', e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Código"
                    value={variant.barcode}
                    onChange={(e) => onUpdateVariant(variant.id, 'barcode', e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={formatarMoeda(basePrice)}
                    value={variant.price ?? ''}
                    onChange={(e) => onUpdateVariant(
                      variant.id, 
                      'price', 
                      e.target.value ? parseFloat(e.target.value) : null
                    )}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={variant.quantity || ''}
                    onChange={(e) => onUpdateVariant(variant.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onRemoveVariant(variant.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover variação
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {variants.length} variação(ões) • Deixe o preço em branco para usar o preço base
      </p>
    </div>
  );
}
