import { supabase } from '@/integrations/supabase/client';
import type { CreateNotificationParams, Notification } from '@/types/notifications';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotificationsTable = any;

export async function createNotification(params: CreateNotificationParams): Promise<Notification | null> {
  const { data, error } = await (supabase
    .from('notifications') as unknown as { insert: (data: NotificationsTable) => { select: () => { single: () => Promise<{ data: Notification | null; error: Error | null }> } } })
    .insert({
      team_id: params.teamId,
      type: params.type,
      category: params.category,
      title: params.title,
      message: params.message,
      action_text: params.actionText || null,
      action_link: params.actionLink || null,
      extra_data: params.extraData || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data as Notification;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNotificationsTable = () => supabase.from('notifications') as any;

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await getNotificationsTable()
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

export async function dismissNotification(notificationId: string): Promise<boolean> {
  const { error } = await getNotificationsTable()
    .update({ is_dismissed: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error dismissing notification:', error);
    return false;
  }

  return true;
}

export async function markAllAsRead(teamId: string): Promise<boolean> {
  const { error } = await getNotificationsTable()
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('team_id', teamId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all as read:', error);
    return false;
  }

  return true;
}

// Helper functions for plan limits
function getPlanProductLimit(planType: string): number {
  const limits: Record<string, number> = {
    free: 5,
    starter: 50,
    professional: 200,
    enterprise: Infinity,
  };
  return limits[planType] || 5;
}

// Check and generate contextual notifications
export async function checkAndGenerateNotifications(teamId: string): Promise<void> {
  try {
    // Fetch products with inventory data
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('team_id', teamId);

    // Fetch inventory items
    const { data: inventoryItems } = await supabase
      .from('inventory_items')
      .select('*, products(name, sku)')
      .eq('team_id', teamId);

    // Fetch current plan
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: planData } = await supabase
      .rpc('get_user_plan', { p_user_id: user.user.id });

    const plan = planData?.[0];

    // Check stock notifications
    if (inventoryItems) {
      for (const item of inventoryItems) {
        const productName = (item.products as { name: string })?.name || 'Produto';

        // Critical stock
        if (item.quantity <= item.critical_stock && item.quantity > 0) {
          // Check if similar notification already exists (not dismissed)
          const { data: existing } = await getNotificationsTable()
            .select('id')
            .eq('team_id', teamId)
            .eq('category', 'stock')
            .eq('is_dismissed', false)
            .ilike('title', '%Estoque Crítico%')
            .contains('extra_data', { inventory_item_id: item.id })
            .maybeSingle();

          if (!existing) {
            await createNotification({
              teamId,
              type: 'critical',
              category: 'stock',
              title: '🚨 Estoque Crítico',
              message: `${productName}${item.size ? ` (${item.size})` : ''} está com apenas ${item.quantity} unidades!`,
              actionText: 'Reabastecer',
              actionLink: '/estoque',
              extraData: { inventory_item_id: item.id, quantity: item.quantity },
            });
          }
        }
        // Low stock
        else if (item.quantity <= item.min_stock && item.quantity > item.critical_stock) {
          const { data: existing } = await getNotificationsTable()
            .select('id')
            .eq('team_id', teamId)
            .eq('category', 'stock')
            .eq('is_dismissed', false)
            .ilike('title', '%Estoque Baixo%')
            .contains('extra_data', { inventory_item_id: item.id })
            .maybeSingle();

          if (!existing) {
            await createNotification({
              teamId,
              type: 'warning',
              category: 'stock',
              title: '⚠️ Estoque Baixo',
              message: `${productName}${item.size ? ` (${item.size})` : ''} está com ${item.quantity} unidades restantes.`,
              actionText: 'Ver Estoque',
              actionLink: '/estoque',
              extraData: { inventory_item_id: item.id, quantity: item.quantity },
            });
          }
        }
        // Out of stock
        else if (item.quantity === 0) {
          const { data: existing } = await getNotificationsTable()
            .select('id')
            .eq('team_id', teamId)
            .eq('category', 'stock')
            .eq('is_dismissed', false)
            .ilike('title', '%Produto Esgotado%')
            .contains('extra_data', { inventory_item_id: item.id })
            .maybeSingle();

          if (!existing) {
            await createNotification({
              teamId,
              type: 'critical',
              category: 'stock',
              title: '❌ Produto Esgotado',
              message: `${productName}${item.size ? ` (${item.size})` : ''} está sem estoque. Você pode estar perdendo vendas!`,
              actionText: 'Adicionar Estoque',
              actionLink: '/estoque',
              extraData: { inventory_item_id: item.id },
            });
          }
        }
      }
    }

    // Check product pricing notifications
    if (products) {
      for (const product of products) {
        // Price below cost
        if (product.sale_price < product.cost_price && product.sale_price > 0) {
          const loss = product.cost_price - product.sale_price;
          
          const { data: existing } = await getNotificationsTable()
            .select('id')
            .eq('team_id', teamId)
            .eq('category', 'product')
            .eq('is_dismissed', false)
            .ilike('title', '%Preço Abaixo do Custo%')
            .contains('extra_data', { product_id: product.id })
            .maybeSingle();

          if (!existing) {
            await createNotification({
              teamId,
              type: 'warning',
              category: 'product',
              title: '💸 Preço Abaixo do Custo',
              message: `${product.name} está com prejuízo de R$ ${loss.toFixed(2)} por unidade.`,
              actionText: 'Ajustar Preço',
              actionLink: '/custos',
              extraData: { product_id: product.id, loss },
            });
          }
        }
      }
    }

    // Check plan limit notifications
    if (plan && products) {
      const totalProducts = products.length;
      const limit = getPlanProductLimit(plan.plan_type);

      if (limit !== Infinity) {
        // At 90% capacity
        if (totalProducts >= limit * 0.9 && totalProducts < limit) {
          const { data: existing } = await getNotificationsTable()
            .select('id')
            .eq('team_id', teamId)
            .eq('category', 'plan')
            .eq('is_dismissed', false)
            .ilike('title', '%Limite Quase Atingido%')
            .maybeSingle();

          if (!existing) {
            await createNotification({
              teamId,
              type: 'warning',
              category: 'plan',
              title: '📊 Limite Quase Atingido',
              message: `Você está usando ${totalProducts} de ${limit} produtos do plano ${plan.plan_name}.`,
              actionText: 'Fazer Upgrade',
              actionLink: '/planos',
              extraData: { total_products: totalProducts, limit },
            });
          }
        }
        // At limit
        else if (totalProducts >= limit) {
          const { data: existing } = await getNotificationsTable()
            .select('id')
            .eq('team_id', teamId)
            .eq('category', 'plan')
            .eq('is_dismissed', false)
            .ilike('title', '%Limite de Produtos Atingido%')
            .maybeSingle();

          if (!existing) {
            await createNotification({
              teamId,
              type: 'critical',
              category: 'plan',
              title: '🚫 Limite de Produtos Atingido',
              message: `Você atingiu o limite de ${limit} produtos. Faça upgrade para continuar.`,
              actionText: 'Ver Planos',
              actionLink: '/planos',
              extraData: { total_products: totalProducts, limit },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
}
