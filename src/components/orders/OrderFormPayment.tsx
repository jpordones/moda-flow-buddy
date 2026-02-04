import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  INSTALLMENT_OPTIONS,
} from "@/types/orders";
import type { PaymentMethod, PaymentStatus, OrderStatus } from "@/types/orders";

interface PaymentData {
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  installments_count: number;
  order_status: OrderStatus;
}

interface OrderFormPaymentProps {
  data: PaymentData;
  onChange: (data: Partial<PaymentData>) => void;
  total: number;
}

export function OrderFormPayment({ data, onChange, total }: OrderFormPaymentProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const installmentValue = total / data.installments_count;

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">Pagamento e Situacao</h3>

      {/* Total Summary */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total do Pedido</span>
          <span className="text-2xl font-bold">{formatCurrency(total)}</span>
        </div>
        {data.installments_count > 1 && (
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-muted-foreground">
              {data.installments_count}x de
            </span>
            <span className="font-medium">{formatCurrency(installmentValue)}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Forma de Pagamento</Label>
          <Select
            value={data.payment_method}
            onValueChange={(value: PaymentMethod) =>
              onChange({ payment_method: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <Label>Status do Pagamento</Label>
          <Select
            value={data.payment_status}
            onValueChange={(value: PaymentStatus) =>
              onChange({ payment_status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Installments */}
        <div className="space-y-2">
          <Label>Parcelas</Label>
          <Select
            value={data.installments_count.toString()}
            onValueChange={(value) =>
              onChange({ installments_count: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INSTALLMENT_OPTIONS.map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}x {num > 1 ? `de ${formatCurrency(total / num)}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order Status */}
        <div className="space-y-2">
          <Label>Situacao do Pedido</Label>
          <Select
            value={data.order_status}
            onValueChange={(value: OrderStatus) =>
              onChange({ order_status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
