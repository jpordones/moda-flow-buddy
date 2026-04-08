import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear, addDays } from 'date-fns';

export type TransactionType = 'entrada' | 'saida';
export type TransactionStatus = 'pendente' | 'confirmado' | 'cancelado' | 'agendado';
export type PeriodType = 'week' | 'month' | 'quarter' | 'year';

export interface CashFlowCategory {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface CashFlowTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  reference_date: string;
  description: string;
  category: string;
  payment_method: string;
  status: TransactionStatus;
  product_id?: string;
  created_at: string;
  // Joined fields
  product?: { name: string; sku: string };
}

export interface CashFlowStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  projected30Days: number;
  incomeTrend: number;
  expensesTrend: number;
  pendingReceivables: number;
  pendingPayables: number;
}

export interface CategoryBreakdown {
  category: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ChartDataPoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CashFlowInsight {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: string;
  text: string;
}

// Default categories for the system
export const defaultIncomeCategories: CashFlowCategory[] = [
  { id: 'cat_vendas', name: 'Vendas de Produtos', type: 'entrada', icon: '🛍️', color: '#10b981', isDefault: true },
  { id: 'cat_vendas_online', name: 'Vendas Online', type: 'entrada', icon: '💳', color: '#059669', isDefault: true },
  { id: 'cat_frete', name: 'Frete Recebido', type: 'entrada', icon: '📦', color: '#34d399', isDefault: true },
  { id: 'cat_servicos', name: 'Serviços', type: 'entrada', icon: '⚙️', color: '#10b981', isDefault: true },
  { id: 'cat_outros_rec', name: 'Outros Recebimentos', type: 'entrada', icon: '💰', color: '#6ee7b7', isDefault: true },
];

export const defaultExpenseCategories: CashFlowCategory[] = [
  { id: 'cat_estoque', name: 'Compra de Estoque', type: 'saida', icon: '📦', color: '#ef4444', isDefault: true },
  { id: 'cat_fornecedores', name: 'Fornecedores', type: 'saida', icon: '🏭', color: '#dc2626', isDefault: true },
  { id: 'cat_marketing', name: 'Marketing e Publicidade', type: 'saida', icon: '📢', color: '#f97316', isDefault: true },
  { id: 'cat_salarios', name: 'Salários e Pró-labore', type: 'saida', icon: '💼', color: '#f59e0b', isDefault: true },
  { id: 'cat_impostos', name: 'Impostos e Taxas', type: 'saida', icon: '🏛️', color: '#eab308', isDefault: true },
  { id: 'cat_aluguel', name: 'Aluguel e Condomínio', type: 'saida', icon: '🏢', color: '#84cc16', isDefault: true },
  { id: 'cat_energia', name: 'Energia e Água', type: 'saida', icon: '⚡', color: '#22c55e', isDefault: true },
  { id: 'cat_telecom', name: 'Internet e Telefone', type: 'saida', icon: '📞', color: '#10b981', isDefault: true },
  { id: 'cat_transporte', name: 'Transporte e Logística', type: 'saida', icon: '🚚', color: '#14b8a6', isDefault: true },
  { id: 'cat_equipamentos', name: 'Equipamentos', type: 'saida', icon: '🖥️', color: '#06b6d4', isDefault: true },
  { id: 'cat_manutencao', name: 'Manutenção', type: 'saida', icon: '🔧', color: '#0ea5e9', isDefault: true },
  { id: 'cat_taxas_bancarias', name: 'Taxas Bancárias', type: 'saida', icon: '🏦', color: '#3b82f6', isDefault: true },
  { id: 'cat_outras_despesas', name: 'Outras Despesas', type: 'saida', icon: '💸', color: '#6366f1', isDefault: true },
];

export const paymentMethods = [
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'transferencia', label: 'Transferência', icon: '🏦' },
];

function getPeriodDates(period: PeriodType): { startDate: Date; endDate: Date } {
  const now = new Date();
  switch (period) {
    case 'week':
      return { startDate: startOfWeek(now, { weekStartsOn: 0 }), endDate: endOfWeek(now, { weekStartsOn: 0 }) };
    case 'month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case 'quarter':
      return { startDate: startOfQuarter(now), endDate: endOfQuarter(now) };
    case 'year':
      return { startDate: startOfYear(now), endDate: endOfYear(now) };
    default:
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
  }
}

function getPreviousPeriodDates(period: PeriodType): { startDate: Date; endDate: Date } {
  const current = getPeriodDates(period);
  const daysDiff = Math.ceil((current.endDate.getTime() - current.startDate.getTime()) / (1000 * 60 * 60 * 24));
  return {
    startDate: new Date(current.startDate.getTime() - daysDiff * 24 * 60 * 60 * 1000),
    endDate: new Date(current.startDate.getTime() - 1),
  };
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function useCashFlow(period: PeriodType = 'month') {
  const { profile, user } = useAuth();
  const teamId = profile?.current_team_id;
  
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!teamId || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getPeriodDates(period);

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          product:products(name, sku)
        `)
        .eq('team_id', teamId)
        .gte('reference_date', format(startDate, 'yyyy-MM-dd'))
        .lte('reference_date', format(endDate, 'yyyy-MM-dd'))
        .order('reference_date', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedTransactions: CashFlowTransaction[] = (data || []).map(t => ({
        id: t.id,
        type: t.type as TransactionType,
        amount: Number(t.amount),
        reference_date: t.reference_date,
        description: t.description || '',
        category: t.category,
        payment_method: t.payment_method || 'dinheiro',
        status: (t.status || 'confirmado') as TransactionStatus,
        product_id: t.product_id,
        created_at: t.created_at,
        product: t.product,
      }));

      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Erro ao carregar transações');
    } finally {
      setIsLoading(false);
    }
  }, [teamId, user, period]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Add transaction
  const addTransaction = useCallback(async (data: {
    type: TransactionType;
    amount: number;
    reference_date: string;
    description: string;
    category: string;
    payment_method: string;
    status?: TransactionStatus;
    product_id?: string;
  }) => {
    if (!teamId || !user) throw new Error('Não autenticado');

    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        team_id: teamId,
        user_id: user.id,
        type: data.type,
        amount: data.amount,
        reference_date: data.reference_date,
        description: data.description,
        category: data.category,
        payment_method: data.payment_method,
        status: data.status || 'confirmado',
      });

    if (insertError) throw insertError;

    await fetchTransactions();
  }, [teamId, user, fetchTransactions]);

  // Update transaction
  const updateTransaction = useCallback(async (id: string, data: Partial<CashFlowTransaction>) => {
    if (!teamId) throw new Error('Não autenticado');

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        type: data.type,
        amount: data.amount,
        reference_date: data.reference_date,
        description: data.description,
        category: data.category,
        payment_method: data.payment_method,
        status: data.status,
      })
      .eq('id', id)
      .eq('team_id', teamId);

    if (updateError) throw updateError;

    await fetchTransactions();
  }, [teamId, fetchTransactions]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    if (!teamId) throw new Error('Não autenticado');

    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);

    if (deleteError) throw deleteError;

    await fetchTransactions();
  }, [teamId, fetchTransactions]);

  // Calculate stats
  const stats = useMemo((): CashFlowStats => {
    const income = transactions
      .filter(t => t.type === 'entrada' && t.status !== 'cancelado')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'saida' && t.status !== 'cancelado')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingReceivables = transactions
      .filter(t => t.type === 'entrada' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayables = transactions
      .filter(t => t.type === 'saida' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    // Simple projection: average daily * 30
    const { startDate, endDate } = getPeriodDates(period);
    const daysInPeriod = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgDailyIncome = income / daysInPeriod;
    const avgDailyExpenses = expenses / daysInPeriod;
    const projected30Days = (income - expenses) + ((avgDailyIncome - avgDailyExpenses) * 30);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      projected30Days,
      incomeTrend: 0, // Would need previous period data
      expensesTrend: 0,
      pendingReceivables,
      pendingPayables,
    };
  }, [transactions, period]);

  // Category breakdown
  const categoryBreakdown = useMemo((): { income: CategoryBreakdown[]; expenses: CategoryBreakdown[] } => {
    const incomeByCategory: Record<string, { amount: number; count: number }> = {};
    const expensesByCategory: Record<string, { amount: number; count: number }> = {};

    transactions.forEach(t => {
      if (t.status === 'cancelado') return;
      
      const target = t.type === 'entrada' ? incomeByCategory : expensesByCategory;
      if (!target[t.category]) {
        target[t.category] = { amount: 0, count: 0 };
      }
      target[t.category].amount += t.amount;
      target[t.category].count += 1;
    });

    const mapToBreakdown = (
      data: Record<string, { amount: number; count: number }>,
      categories: CashFlowCategory[],
      total: number
    ): CategoryBreakdown[] => {
      return Object.entries(data)
        .map(([category, { amount, count }]) => {
          const cat = categories.find(c => c.name === category) || { icon: '💰', color: '#6b7280' };
          return {
            category,
            icon: cat.icon,
            color: cat.color,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
            count,
          };
        })
        .sort((a, b) => b.amount - a.amount);
    };

    return {
      income: mapToBreakdown(incomeByCategory, defaultIncomeCategories, stats.totalIncome),
      expenses: mapToBreakdown(expensesByCategory, defaultExpenseCategories, stats.totalExpenses),
    };
  }, [transactions, stats]);

  // Chart data (last 6 months)
  const chartData = useMemo((): ChartDataPoint[] => {
    const months: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, 'MMM');

      // Filter transactions for this month (need to fetch all for chart)
      const monthTransactions = transactions.filter(t => {
        const txDate = parseISO(t.reference_date);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: monthLabel,
        income,
        expenses,
        balance: income - expenses,
      });
    }

    return months;
  }, [transactions]);

  // Generate insights
  const insights = useMemo((): CashFlowInsight[] => {
    const result: CashFlowInsight[] = [];

    // Positive balance
    if (stats.balance > 0) {
      result.push({
        type: 'success',
        icon: '✅',
        text: `Fluxo de caixa saudável. Reserve 20% (${formatValue(stats.balance * 0.2)}) para impostos.`,
      });
    } else if (stats.balance < 0) {
      result.push({
        type: 'danger',
        icon: '⚠️',
        text: `Atenção: Saldo negativo de ${formatValue(Math.abs(stats.balance))}. Revise suas despesas.`,
      });
    }

    // Pending receivables
    if (stats.pendingReceivables > 0) {
      result.push({
        type: 'info',
        icon: '💰',
        text: `Você tem ${formatValue(stats.pendingReceivables)} em recebíveis pendentes.`,
      });
    }

    // Top expense category
    if (categoryBreakdown.expenses.length > 0) {
      const topExpense = categoryBreakdown.expenses[0];
      if (topExpense.percentage > 40) {
        result.push({
          type: 'warning',
          icon: '📊',
          text: `${topExpense.category} representa ${topExpense.percentage.toFixed(0)}% das suas despesas. Considere otimizar.`,
        });
      }
    }

    // Growth indicator
    if (stats.incomeTrend > 10) {
      result.push({
        type: 'success',
        icon: '📈',
        text: `Suas vendas cresceram ${stats.incomeTrend}% em relação ao período anterior!`,
      });
    }

    return result.slice(0, 4);
  }, [stats, categoryBreakdown]);

  return {
    transactions,
    stats,
    categoryBreakdown,
    chartData,
    insights,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}

function formatValue(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
