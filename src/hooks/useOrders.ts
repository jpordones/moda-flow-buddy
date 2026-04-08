import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Order, OrderFormData, OrderItem, OrderStatus, PaymentStatus, PaymentMethod } from "@/types/orders";

interface OrderFilters {
  search?: string;
  order_status?: OrderStatus | 'all';
  payment_status?: PaymentStatus | 'all';
  payment_method?: PaymentMethod | 'all';
  date_from?: string;
  date_to?: string;
}

interface UseOrdersOptions {
  page?: number;
  pageSize?: number;
  filters?: OrderFilters;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const teamId = profile?.current_team_id;
  
  const { page = 1, pageSize = 20, filters = {} } = options;

  const ordersQuery = useQuery({
    queryKey: ['orders', teamId, page, pageSize, filters],
    queryFn: async () => {
      if (!teamId) return { data: [], count: 0 };

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('team_id', teamId)
        .order('order_date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%`);
      }

      if (filters.order_status && filters.order_status !== 'all') {
        query = query.eq('order_status', filters.order_status);
      }

      if (filters.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters.payment_method && filters.payment_method !== 'all') {
        query = query.eq('payment_method', filters.payment_method);
      }

      if (filters.date_from) {
        query = query.gte('order_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('order_date', filters.date_to);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch order items for each order
      if (data && data.length > 0) {
        const orderIds = data.map(o => o.id);
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (itemsError) throw itemsError;

        const ordersWithItems = data.map(order => ({
          ...order,
          order_items: items?.filter(item => item.order_id === order.id) || [],
        }));

        return { data: ordersWithItems as Order[], count: count || 0 };
      }

      return { data: data as Order[], count: count || 0 };
    },
    enabled: !!teamId,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (formData: OrderFormData) => {
      if (!teamId || !user) throw new Error('Usuário não autenticado');

      // Calculate total
      const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          team_id: teamId,
          created_by_user_id: user.id,
          customer_name: formData.customer_name,
          customer_contact: formData.customer_contact || null,
          order_date: formData.order_date,
          notes: formData.notes || null,
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,
          installments_count: formData.installments_count,
          total_amount: total,
          order_status: formData.order_status,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      if (formData.items.length > 0) {
        const itemsToInsert = formData.items.map(item => ({
          team_id: teamId,
          order_id: order.id,
          product_id: item.product_id || null,
          product_name_snapshot: item.product_name_snapshot,
          base_color: item.base_color || null,
          size: item.size || null,
          print_variant: item.print_variant || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.quantity * item.unit_price,
          notes: item.notes || null,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido criado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao criar pedido');
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, formData }: { orderId: string; formData: OrderFormData }) => {
      if (!teamId || !user) throw new Error('Usuário não autenticado');

      const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          customer_name: formData.customer_name,
          customer_contact: formData.customer_contact || null,
          order_date: formData.order_date,
          notes: formData.notes || null,
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,
          installments_count: formData.installments_count,
          total_amount: total,
          order_status: formData.order_status,
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;

      // Insert new items
      if (formData.items.length > 0) {
        const itemsToInsert = formData.items.map(item => ({
          team_id: teamId,
          order_id: orderId,
          product_id: item.product_id || null,
          product_name_snapshot: item.product_name_snapshot,
          base_color: item.base_color || null,
          size: item.size || null,
          print_variant: item.print_variant || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.quantity * item.unit_price,
          notes: item.notes || null,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido atualizado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar pedido:', error);
      toast.error('Erro ao atualizar pedido');
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido excluído com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao excluir pedido:', error);
      toast.error('Erro ao excluir pedido');
    },
  });

  return {
    orders: ordersQuery.data?.data || [],
    totalCount: ordersQuery.data?.count || 0,
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    
    createOrder: createOrderMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
  };
}

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      return { ...order, order_items: items } as Order;
    },
    enabled: !!orderId,
  });
}
