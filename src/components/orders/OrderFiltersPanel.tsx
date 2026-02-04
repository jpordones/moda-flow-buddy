import { Input } from "@/components/ui/input";
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
} from "@/types/orders";
import type { OrderStatus, PaymentStatus, PaymentMethod } from "@/types/orders";

interface FilterValues {
  order_status: OrderStatus | 'all';
  payment_status: PaymentStatus | 'all';
  payment_method: PaymentMethod | 'all';
  date_from: string;
  date_to: string;
}

interface OrderFiltersPanelProps {
  filters: FilterValues;
  onFilterChange: (key: string, value: string) => void;
}

export function OrderFiltersPanel({ filters, onFilterChange }: OrderFiltersPanelProps) {
  return (
    <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label>Situacao do Pedido</Label>
        <Select
          value={filters.order_status}
          onValueChange={(value) => onFilterChange('order_status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status Pagamento</Label>
        <Select
          value={filters.payment_status}
          onValueChange={(value) => onFilterChange('payment_status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Forma de Pagamento</Label>
        <Select
          value={filters.payment_method}
          onValueChange={(value) => onFilterChange('payment_method', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Data Inicial</Label>
        <Input
          type="date"
          value={filters.date_from}
          onChange={(e) => onFilterChange('date_from', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Data Final</Label>
        <Input
          type="date"
          value={filters.date_to}
          onChange={(e) => onFilterChange('date_to', e.target.value)}
        />
      </div>
    </div>
  );
}
