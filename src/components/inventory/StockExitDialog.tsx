import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Loader2, AlertTriangle } from 'lucide-react';
import { movementReasons, InventoryItem } from '@/types/inventory';
import { ProductWithInventory } from '@/types/inventory';

interface StockExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productsWithInventory: ProductWithInventory[];
  onSubmit: (data: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => Promise<boolean>;
  preselectedItem?: InventoryItem;
}

export function StockExitDialog({ 
  open, 
  onOpenChange, 
  productsWithInventory, 
  onSubmit,
  preselectedItem 
}: StockExitDialogProps) {
  const [productId, setProductId] = useState(preselectedItem?.productId || '');
  const [itemId, setItemId] = useState(preselectedItem?.id || '');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('venda');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedItem) {
      setProductId(preselectedItem.productId);
      setItemId(preselectedItem.id);
    }
  }, [preselectedItem]);

  const resetForm = () => {
    if (!preselectedItem) {
      setProductId('');
      setItemId('');
    }
    setQuantity('');
    setReason('venda');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedItem = selectedProduct?.inventoryItems.find(i => i.id === itemId);
    if (!selectedItem || !quantity) return;

    setIsSubmitting(true);
    const success = await onSubmit({
      productId: selectedItem.productId,
      size: selectedItem.size,
      color: selectedItem.color,
      quantity: parseInt(quantity),
      reason,
      notes: notes || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const selectedProduct = productsWithInventory.find(p => p.id === productId);
  const selectedItem = selectedProduct?.inventoryItems.find(i => i.id === itemId);
  const maxQuantity = selectedItem?.quantity || 0;
  const requestedQuantity = parseInt(quantity) || 0;
  const canSubmit = selectedItem && requestedQuantity > 0 && requestedQuantity <= maxQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Minus className="h-5 w-5 text-danger" />
            Nova Saída de Estoque
          </DialogTitle>
          <DialogDescription>
            Registre a saída de produtos do estoque
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={productId} onValueChange={(v) => { setProductId(v); setItemId(''); }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {productsWithInventory.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sku}) - {p.totalStock} un
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variation Selection */}
          {selectedProduct && (
            <div className="space-y-2">
              <Label htmlFor="variation">Variação</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione a variação" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.inventoryItems.map(item => (
                    <SelectItem 
                      key={item.id} 
                      value={item.id}
                      disabled={item.quantity === 0}
                    >
                      {item.size} / {item.color} - {item.quantity} un
                      {item.quantity === 0 && ' (sem estoque)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantidade
              {maxQuantity > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  (máx: {maxQuantity})
                </span>
              )}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 5"
              className="h-11"
            />
            {requestedQuantity > maxQuantity && (
              <p className="text-sm text-danger flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Quantidade maior que o estoque disponível
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movementReasons.saida.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex-1 h-11"
              variant="danger"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  Confirmar Saída
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
