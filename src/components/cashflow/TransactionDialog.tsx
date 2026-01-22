import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CashFlowTransaction, 
  TransactionType, 
  defaultIncomeCategories, 
  defaultExpenseCategories,
  paymentMethods,
} from "@/hooks/useCashFlow";
import { formatarMoeda, parseMoeda } from "@/lib/formatters";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(['entrada', 'saida']),
  amount: z.number().positive('Valor deve ser positivo'),
  reference_date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  payment_method: z.string().min(1, 'Forma de pagamento é obrigatória'),
});

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    reference_date: string;
    description: string;
    category: string;
    payment_method: string;
  }) => Promise<void>;
  editingTransaction?: CashFlowTransaction | null;
}

export function TransactionDialog({ isOpen, onClose, onSubmit, editingTransaction }: TransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<TransactionType>('entrada');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString().replace('.', ','));
        setDate(editingTransaction.reference_date);
        setDescription(editingTransaction.description);
        setCategory(editingTransaction.category);
        setPaymentMethod(editingTransaction.payment_method);
      } else {
        setType('entrada');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setCategory('');
        setPaymentMethod('pix');
      }
    }
  }, [isOpen, editingTransaction]);

  // Reset category when type changes
  useEffect(() => {
    if (!editingTransaction) {
      setCategory('');
    }
  }, [type, editingTransaction]);

  const handleAmountChange = (value: string) => {
    // Allow only numbers, comma, and dot
    const cleaned = value.replace(/[^\d,\.]/g, '');
    setAmount(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseMoeda(amount);

    try {
      transactionSchema.parse({
        type,
        amount: parsedAmount,
        reference_date: date,
        description: description.trim(),
        category,
        payment_method: paymentMethod,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      await onSubmit({
        type,
        amount: parsedAmount,
        reference_date: date,
        description: description.trim(),
        category,
        payment_method: paymentMethod,
      });

      toast.success(
        editingTransaction ? 'Transação atualizada!' : 'Transação registrada!',
        { description: `${description} - ${formatarMoeda(parsedAmount)}` }
      );

      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Erro ao salvar transação');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = type === 'entrada' ? defaultIncomeCategories : defaultExpenseCategories;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {editingTransaction 
              ? 'Atualize os dados da transação' 
              : 'Registre uma nova entrada ou saída financeira'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Type Selector */}
          <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrada" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Entrada
              </TabsTrigger>
              <TabsTrigger value="saida" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Saída
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Date and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-11"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <span className="flex items-center gap-2">
                      <span>{method.icon}</span>
                      <span>{method.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={255}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/255
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingTransaction ? 'Atualizar' : 'Registrar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
