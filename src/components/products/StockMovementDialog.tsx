import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Product } from "@/types/products";

interface StockMovementDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (productId: string, quantity: number, type: 'entrada' | 'saida', reason: string) => void;
}

const entryReasons = ["Compra", "Produção", "Devolução de cliente", "Ajuste de inventário", "Transferência entrada"];
const exitReasons = ["Venda", "Perda", "Devolução ao fornecedor", "Ajuste de inventário", "Transferência saída"];

export function StockMovementDialog({ product, open, onOpenChange, onSubmit }: StockMovementDialogProps) {
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !quantity || !reason) return;
    
    onSubmit(product.id, parseInt(quantity), type, reason);
    setQuantity("");
    setReason("");
    setNotes("");
    onOpenChange(false);
  };

  const reasons = type === 'entrada' ? entryReasons : exitReasons;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentação de Estoque</DialogTitle>
          <DialogDescription>
            {product?.name} - Estoque atual: {product?.quantity} {product?.unit}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Tipo de Movimentação</Label>
            <RadioGroup
              value={type}
              onValueChange={(value: 'entrada' | 'saida') => {
                setType(value);
                setReason("");
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entrada" id="entrada" />
                <Label htmlFor="entrada" className="font-normal cursor-pointer">Entrada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saida" id="saida" />
                <Label htmlFor="saida" className="font-normal cursor-pointer">Saída</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {type === 'saida' && product && parseInt(quantity) > product.quantity && (
              <p className="text-sm text-danger">
                Quantidade maior que o estoque disponível
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="action"
              disabled={type === 'saida' && product && parseInt(quantity) > product.quantity}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
