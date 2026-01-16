import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { movementReasons } from '@/types/inventory';
import { Product } from '@/types/products';
import { defaultSizes, defaultColors } from '@/types/products';

interface StockEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => Promise<boolean>;
  preselectedProductId?: string;
}

export function StockEntryDialog({ 
  open, 
  onOpenChange, 
  products, 
  onSubmit,
  preselectedProductId 
}: StockEntryDialogProps) {
  const [productId, setProductId] = useState(preselectedProductId || '');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('compra');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    }
  }, [preselectedProductId]);

  const resetForm = () => {
    if (!preselectedProductId) setProductId('');
    setSize('');
    setColor('');
    setQuantity('');
    setReason('compra');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !size || !color || !quantity) return;

    setIsSubmitting(true);
    const success = await onSubmit({
      productId,
      size,
      color,
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

  const selectedProduct = products.find(p => p.id === productId);
  const canSubmit = productId && size && color && parseInt(quantity) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-success" />
            Nova Entrada de Estoque
          </DialogTitle>
          <DialogDescription>
            Registre a entrada de produtos no estoque
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {defaultSizes.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {defaultColors.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 50"
              className="h-11"
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movementReasons.entrada.map(r => (
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
              variant="action"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Confirmar Entrada
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
