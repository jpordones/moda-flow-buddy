import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HistoricalDataPoint } from '@/lib/forecastAlgorithms';

interface SalesHistoryData {
  month: Date;
  totalSold: number;
  transactionCount: number;
}

interface UseSalesHistoryReturn {
  fetchSalesHistory: (productId: string, months?: number) => Promise<HistoricalDataPoint[]>;
  isLoading: boolean;
  error: string | null;
}

function getMonthName(date: Date): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[date.getMonth()];
}

export function useSalesHistory(): UseSalesHistoryReturn {
  const { profile } = useAuth();
  const teamId = profile?.current_team_id;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesHistory = useCallback(async (
    productId: string,
    months: number = 12
  ): Promise<HistoricalDataPoint[]> => {
    if (!teamId) {
      setError('Equipe não encontrada');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Fetch stock movements (sales = type 'saida')
      const { data: movements, error: movementsError } = await supabase
        .from('stock_movements')
        .select('quantity, created_at, type')
        .eq('product_id', productId)
        .eq('team_id', teamId)
        .eq('type', 'saida')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (movementsError) {
        throw movementsError;
      }

      // Group by month
      const monthlyData: Map<string, SalesHistoryData> = new Map();

      // Initialize all months in range
      const current = new Date(startDate);
      while (current <= endDate) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, {
          month: new Date(current),
          totalSold: 0,
          transactionCount: 0,
        });
        current.setMonth(current.getMonth() + 1);
      }

      // Aggregate sales by month
      movements?.forEach(movement => {
        const date = new Date(movement.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const existing = monthlyData.get(monthKey);
        if (existing) {
          existing.totalSold += movement.quantity;
          existing.transactionCount += 1;
        }
      });

      // Convert to HistoricalDataPoint format
      const result: HistoricalDataPoint[] = Array.from(monthlyData.values())
        .map(data => ({
          month: getMonthName(data.month),
          date: data.month,
          value: data.totalSold,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      return result;
    } catch (err) {
      console.error('Error fetching sales history:', err);
      setError('Erro ao buscar histórico de vendas');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  return {
    fetchSalesHistory,
    isLoading,
    error,
  };
}

// Generate synthetic data based on product category and price
export function generateSyntheticHistory(
  category: string,
  salePrice: number,
  months: number = 12
): HistoricalDataPoint[] {
  // Base monthly sales by category
  const categoryBaselines: Record<string, { low: number; medium: number; high: number }> = {
    'Camisetas': { low: 45, medium: 75, high: 120 },
    'Calças': { low: 25, medium: 45, high: 75 },
    'Vestidos': { low: 20, medium: 40, high: 65 },
    'Shorts': { low: 30, medium: 55, high: 90 },
    'Saias': { low: 15, medium: 30, high: 50 },
    'Moletons': { low: 20, medium: 40, high: 65 },
    'Acessórios': { low: 50, medium: 85, high: 140 },
    'Bolsas': { low: 15, medium: 30, high: 50 },
    'Calçados': { low: 20, medium: 40, high: 70 },
    'Outros': { low: 25, medium: 45, high: 75 },
  };

  const baseline = categoryBaselines[category] || categoryBaselines['Outros'];
  
  // Determine price tier
  let priceRange: 'low' | 'medium' | 'high';
  if (salePrice < 50) priceRange = 'high'; // Cheaper items sell more
  else if (salePrice < 150) priceRange = 'medium';
  else priceRange = 'low';

  const baseSales = baseline[priceRange];

  // Seasonal multipliers (Brazilian market)
  const seasonalMultipliers: Record<number, number> = {
    0: 0.9,  // Janeiro - pós-festas
    1: 0.85, // Fevereiro - carnaval (menos vendas moda geral)
    2: 0.95, // Março
    3: 1.0,  // Abril
    4: 1.15, // Maio - Dia das Mães
    5: 1.2,  // Junho - Dia dos Namorados
    6: 0.9,  // Julho - férias
    7: 0.95, // Agosto - Dia dos Pais
    8: 1.0,  // Setembro
    9: 1.1,  // Outubro - Dia das Crianças
    10: 1.4, // Novembro - Black Friday
    11: 1.5, // Dezembro - Natal
  };

  const result: HistoricalDataPoint[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);

    const monthIndex = date.getMonth();
    const seasonalFactor = seasonalMultipliers[monthIndex];
    
    // Add some randomness (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    // Add growth trend (small positive trend)
    const growthFactor = 1 + (months - i) * 0.01;
    
    const sales = Math.round(baseSales * seasonalFactor * randomFactor * growthFactor);

    result.push({
      month: getMonthName(date),
      date,
      value: Math.max(0, sales),
    });
  }

  return result;
}
