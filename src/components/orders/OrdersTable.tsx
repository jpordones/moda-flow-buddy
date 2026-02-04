import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Edit, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/types/orders";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from "@/types/orders";
import { cn } from "@/lib/utils";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onEdit: (order: Order) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrdersTable({
  orders,
  isLoading,
  onEdit,
  page,
  totalPages,
  onPageChange,
}: OrdersTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getProductsSummary = (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      return '-';
    }
    if (order.order_items.length === 1) {
      return order.order_items[0].product_name_snapshot;
    }
    return `${order.order_items[0].product_name_snapshot} +${order.order_items.length - 1}`;
  };

  const getFirstItemDetail = (order: Order, field: 'base_color' | 'size' | 'print_variant') => {
    if (!order.order_items || order.order_items.length === 0) {
      return '-';
    }
    return order.order_items[0][field] || '-';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          Nenhum pedido encontrado
        </p>
        <p className="text-sm text-muted-foreground">
          Crie seu primeiro pedido clicando no botao acima
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto(s)</TableHead>
              <TableHead className="hidden md:table-cell">Cor</TableHead>
              <TableHead className="hidden lg:table-cell">Estampa</TableHead>
              <TableHead className="hidden md:table-cell">Tamanho</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="hidden sm:table-cell">Parcelas</TableHead>
              <TableHead>Situacao</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="w-[80px]">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    {order.customer_contact && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {order.customer_contact}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="truncate max-w-[150px] block">
                    {getProductsSummary(order)}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getFirstItemDetail(order, 'base_color')}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {getFirstItemDetail(order, 'print_variant')}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getFirstItemDetail(order, 'size')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[order.payment_method]}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", PAYMENT_STATUS_COLORS[order.payment_status])}
                    >
                      {PAYMENT_STATUS_LABELS[order.payment_status]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.total_amount)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center">
                  {order.installments_count}x
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs whitespace-nowrap", ORDER_STATUS_COLORS[order.order_status])}
                  >
                    {ORDER_STATUS_LABELS[order.order_status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {format(new Date(order.order_date), "dd/MM/yy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(order)}
                    title="Editar pedido"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Pagina {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
