import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CustomerData {
  customer_name: string;
  customer_contact: string;
  order_date: string;
  notes: string;
}

interface OrderFormCustomerProps {
  data: CustomerData;
  onChange: (data: Partial<CustomerData>) => void;
}

export function OrderFormCustomer({ data, onChange }: OrderFormCustomerProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Dados do Cliente</h3>
      
      <div className="space-y-2">
        <Label htmlFor="customer_name">Nome do Cliente *</Label>
        <Input
          id="customer_name"
          placeholder="Digite o nome do cliente"
          value={data.customer_name}
          onChange={(e) => onChange({ customer_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_contact">Contato (opcional)</Label>
        <Input
          id="customer_contact"
          placeholder="Email, telefone ou Instagram"
          value={data.customer_contact}
          onChange={(e) => onChange({ customer_contact: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order_date">Data do Pedido</Label>
        <Input
          id="order_date"
          type="date"
          value={data.order_date}
          onChange={(e) => onChange({ order_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observacoes (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Anotacoes sobre o pedido..."
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}
