import { Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import type { OrderItemFormData } from "@/types/orders";
import { normalizeVariationValue } from "@/lib/variationUtils";

interface OrderFormItemsProps {
  items: OrderItemFormData[];
  onChange: (items: OrderItemFormData[]) => void;
}

export function OrderFormItems({ items, onChange }: OrderFormItemsProps) {
  const { products, isLoading: loadingProducts } = useProducts();
  const { inventoryItems } = useInventory();

  const addItem = () => {
    onChange([
      ...items,
      {
        product_id: '',
        product_name_snapshot: '',
        base_color: '',
        size: '',
        print_variant: '',
        quantity: 1,
        unit_price: 0,
        notes: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<OrderItemFormData>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateItem(index, {
        product_id: productId,
        product_name_snapshot: product.name,
        unit_price: product.salePrice,
        base_color: '',
        size: '',
        print_variant: '',
      });
    }
  };

  // Get available variations from inventory for a product
  const getProductVariations = (productId: string): {
    sizes: string[];
    colors: string[];
    prints: string[];
  } => {
    if (!productId) return { sizes: [], colors: [], prints: [] };

    // Get inventory items for this product
    const productItems = inventoryItems.filter(i => i.productId === productId);

    const sizes = new Set<string>();
    const colors = new Set<string>();
    const prints = new Set<string>();

    productItems.forEach(item => {
      // Use variantOptions if available, otherwise use legacy fields
      if (item.variantOptions && Object.keys(item.variantOptions).length > 0) {
        const opts = item.variantOptions;
        if (opts['Tamanho']) sizes.add(opts['Tamanho']);
        if (opts['Cor']) colors.add(opts['Cor']);
        if (opts['Estampa']) prints.add(opts['Estampa']);
      } else {
        if (item.size && item.size !== 'Único') sizes.add(item.size);
        if (item.color && item.color !== 'Padrão') colors.add(item.color);
      }
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      prints: Array.from(prints).sort(),
    };
  };

  // Check stock availability for an order item
  const getStockAvailability = (item: OrderItemFormData): {
    available: number;
    hasStock: boolean;
    message?: string;
  } => {
    if (!item.product_id) return { available: 0, hasStock: true };

    const normSize = normalizeVariationValue(item.size) || 'Único';
    const normColor = normalizeVariationValue(item.base_color) || 'Padrão';

    const inventoryItem = inventoryItems.find(i => {
      const itemSize = normalizeVariationValue(i.size) || 'Único';
      const itemColor = normalizeVariationValue(i.color) || 'Padrão';
      return i.productId === item.product_id && 
             itemSize === normSize && 
             itemColor === normColor;
    });

    if (!inventoryItem) {
      // Check if product has any inventory at all
      const hasAnyInventory = inventoryItems.some(i => i.productId === item.product_id);
      if (hasAnyInventory && (item.size || item.base_color)) {
        return {
          available: 0,
          hasStock: false,
          message: `Variação não encontrada`,
        };
      }
      // No inventory - product might be infinite stock or not tracked
      return { available: 0, hasStock: true };
    }

    const hasStock = inventoryItem.quantity >= item.quantity;
    return {
      available: inventoryItem.quantity,
      hasStock,
      message: hasStock 
        ? undefined 
        : `Disponível: ${inventoryItem.quantity}`,
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Itens do Pedido</h3>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum item adicionado. Clique em "Adicionar Item" para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const variations = getProductVariations(item.product_id);
            const stockInfo = getStockAvailability(item);

            return (
              <Card key={index} className={!stockInfo.hasStock && item.product_id ? 'border-warning' : ''}>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid gap-4 sm:grid-cols-2">
                      {/* Product Selection */}
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Produto *</Label>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => handleProductChange(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.salePrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Color */}
                      <div className="space-y-2">
                        <Label>Cor</Label>
                        {variations.colors.length > 0 ? (
                          <Select
                            value={item.base_color}
                            onValueChange={(value) => updateItem(index, { base_color: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {variations.colors.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Ex: Preto"
                            value={item.base_color}
                            onChange={(e) => updateItem(index, { base_color: e.target.value })}
                          />
                        )}
                      </div>

                      {/* Size */}
                      <div className="space-y-2">
                        <Label>Tamanho</Label>
                        {variations.sizes.length > 0 ? (
                          <Select
                            value={item.size}
                            onValueChange={(value) => updateItem(index, { size: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {variations.sizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Ex: M"
                            value={item.size}
                            onChange={(e) => updateItem(index, { size: e.target.value })}
                          />
                        )}
                      </div>

                      {/* Print Variant */}
                      <div className="space-y-2">
                        <Label>Estampa/Variação</Label>
                        {variations.prints.length > 0 ? (
                          <Select
                            value={item.print_variant}
                            onValueChange={(value) => updateItem(index, { print_variant: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {variations.prints.map((print) => (
                                <SelectItem key={print} value={print}>
                                  {print}
                                </SelectItem>
                              ))}
                              <SelectItem value="">Nenhuma</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Ex: Champion"
                            value={item.print_variant}
                            onChange={(e) => updateItem(index, { print_variant: e.target.value })}
                          />
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Quantidade *
                          {!stockInfo.hasStock && item.product_id && (
                            <Badge variant="warning" className="text-xs gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {stockInfo.message}
                            </Badge>
                          )}
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, { quantity: parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="space-y-2">
                        <Label>Preço Unitário</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>

                      {/* Line Total */}
                      <div className="space-y-2">
                        <Label>Subtotal</Label>
                        <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-medium">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Observação do Item (opcional)</Label>
                        <Textarea
                          placeholder="Anotações específicas deste item..."
                          value={item.notes}
                          onChange={(e) => updateItem(index, { notes: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Total */}
          <div className="flex justify-end">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <span className="text-sm text-muted-foreground mr-2">Total:</span>
              <span className="text-lg font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
