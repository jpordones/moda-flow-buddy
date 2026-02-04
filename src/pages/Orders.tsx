import { useState } from "react";
import { Plus, Search, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/hooks/useOrders";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderDialog } from "@/components/orders/OrderDialog";
import { OrderFiltersPanel } from "@/components/orders/OrderFiltersPanel";
import type { OrderStatus, PaymentStatus, PaymentMethod, Order } from "@/types/orders";

export default function Orders() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    order_status: 'all' as OrderStatus | 'all',
    payment_status: 'all' as PaymentStatus | 'all',
    payment_method: 'all' as PaymentMethod | 'all',
    date_from: '',
    date_to: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const { orders, totalCount, isLoading } = useOrders({
    page,
    pageSize: 20,
    filters: {
      search: debouncedSearch,
      ...filters,
    },
  });

  const totalPages = Math.ceil(totalCount / 20);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Debounce search
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    setDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingOrder(null);
  };

  const clearFilters = () => {
    setFilters({
      order_status: 'all',
      payment_status: 'all',
      payment_method: 'all',
      date_from: '',
      date_to: '',
    });
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const hasActiveFilters = 
    filters.order_status !== 'all' ||
    filters.payment_status !== 'all' ||
    filters.payment_method !== 'all' ||
    filters.date_from ||
    filters.date_to ||
    debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie seus pedidos manuais
          </p>
        </div>
        <Button onClick={handleNewOrder} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <OrderFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <OrdersTable
            orders={orders}
            isLoading={isLoading}
            onEdit={handleEditOrder}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Order Dialog */}
      <OrderDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        order={editingOrder}
      />
    </div>
  );
}
