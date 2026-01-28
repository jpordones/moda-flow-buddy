import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HistoricalDataPoint, 
  ForecastDataPoint, 
  TrendAnalysis, 
  SeasonalityAnalysis,
  ForecastMetrics,
  ForecastInsight 
} from '@/lib/forecastAlgorithms';

export interface ForecastHistoryItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  period_months: number;
  method: string;
  accuracy: number | null;
  trend_direction: string | null;
  trend_rate: number | null;
  created_at: string;
  payload: ForecastPayload;
}

export interface ForecastPayload {
  historical: HistoricalDataPoint[];
  forecasts: ForecastDataPoint[];
  trend: TrendAnalysis | null;
  seasonality: SeasonalityAnalysis | null;
  metrics: ForecastMetrics | null;
  insights: ForecastInsight[];
  currentStock: number;
}

// Helper function to serialize dates for JSON storage
function serializeForecastPayload(payload: ForecastPayload): Record<string, unknown> {
  return {
    historical: payload.historical.map(h => ({
      ...h,
      date: h.date.toISOString(),
    })),
    forecasts: payload.forecasts.map(f => ({
      ...f,
      date: f.date.toISOString(),
    })),
    trend: payload.trend,
    seasonality: payload.seasonality,
    metrics: payload.metrics,
    insights: payload.insights,
    currentStock: payload.currentStock,
  };
}

// Helper function to deserialize dates from JSON storage
function deserializeForecastPayload(data: Record<string, unknown>): ForecastPayload {
  const historical = (data.historical as Array<Record<string, unknown>> || []).map(h => ({
    ...h,
    date: new Date(h.date as string),
  })) as HistoricalDataPoint[];
  
  const forecasts = (data.forecasts as Array<Record<string, unknown>> || []).map(f => ({
    ...f,
    date: new Date(f.date as string),
  })) as ForecastDataPoint[];

  return {
    historical,
    forecasts,
    trend: data.trend as TrendAnalysis | null,
    seasonality: data.seasonality as SeasonalityAnalysis | null,
    metrics: data.metrics as ForecastMetrics | null,
    insights: data.insights as ForecastInsight[],
    currentStock: data.currentStock as number || 0,
  };
}

export function useForecastHistory() {
  const { profile, user } = useAuth();
  const teamId = profile?.current_team_id;
  
  const [history, setHistory] = useState<ForecastHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch forecast history
  const fetchHistory = useCallback(async (limit: number = 20) => {
    if (!teamId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('demand_forecast_history')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const items: ForecastHistoryItem[] = (data || []).map(row => ({
        id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_sku: row.product_sku,
        period_months: row.period_months,
        method: row.method,
        accuracy: row.accuracy ? Number(row.accuracy) : null,
        trend_direction: row.trend_direction,
        trend_rate: row.trend_rate ? Number(row.trend_rate) : null,
        created_at: row.created_at,
        payload: deserializeForecastPayload(
          (typeof row.payload === 'object' && row.payload !== null) 
            ? row.payload as Record<string, unknown>
            : {}
        ),
      }));

      setHistory(items);
    } catch (error) {
      console.error('Erro ao carregar histórico de previsões:', error);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  // Save a new forecast to history
  const saveForecast = useCallback(async (params: {
    product_id: string;
    product_name: string;
    product_sku: string;
    period_months: number;
    method: string;
    accuracy: number | null;
    trend: TrendAnalysis | null;
    payload: ForecastPayload;
  }) => {
    if (!teamId || !user) {
      throw new Error('Não autenticado');
    }

    // Serialize payload to JSON-compatible format
    const serializedPayload = JSON.parse(JSON.stringify(serializeForecastPayload(params.payload)));

    const { error } = await supabase
      .from('demand_forecast_history')
      .insert([{
        team_id: teamId,
        user_id: user.id,
        product_id: params.product_id,
        product_name: params.product_name,
        product_sku: params.product_sku,
        period_months: params.period_months,
        method: params.method,
        accuracy: params.accuracy,
        trend_direction: params.trend?.direction || null,
        trend_rate: params.trend?.rate || null,
        payload: serializedPayload,
      }]);

    if (error) throw error;

    // Refresh history
    await fetchHistory();
  }, [teamId, user, fetchHistory]);

  // Delete a forecast from history
  const deleteForecast = useCallback(async (id: string) => {
    if (!teamId) {
      throw new Error('Não autenticado');
    }

    const { error } = await supabase
      .from('demand_forecast_history')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);

    if (error) throw error;

    setHistory(prev => prev.filter(h => h.id !== id));
  }, [teamId]);

  return {
    history,
    isLoading,
    fetchHistory,
    saveForecast,
    deleteForecast,
  };
}
