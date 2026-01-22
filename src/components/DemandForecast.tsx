import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, TrendingUp, TrendingDown, Minus, Brain, Package, 
  AlertTriangle, Lightbulb, Search, Calendar, Target, 
  BarChart3, ChevronRight, Sparkles, Info
} from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useSalesHistory, generateSyntheticHistory } from "@/hooks/useSalesHistory";
import { 
  generateForecast, 
  detectTrend, 
  detectSeasonality, 
  generateInsights,
  HistoricalDataPoint,
  ForecastDataPoint,
  TrendAnalysis,
  SeasonalityAnalysis,
  ForecastMetrics,
  ForecastInsight,
} from "@/lib/forecastAlgorithms";
import { Product } from "@/types/products";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

interface DemandForecastProps {
  initialProduct?: Product;
}

interface ChartDataPoint {
  month: string;
  date: string;
  historical?: number;
  forecast?: number;
  lower?: number;
  upper?: number;
}

export function DemandForecast({ initialProduct }: DemandForecastProps) {
  const { products } = useProducts();
  const { fetchSalesHistory, isLoading: isFetchingHistory } = useSalesHistory();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [period, setPeriod] = useState<number>(6);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  // Forecast state
  const [historical, setHistorical] = useState<HistoricalDataPoint[]>([]);
  const [forecasts, setForecasts] = useState<ForecastDataPoint[]>([]);
  const [trend, setTrend] = useState<TrendAnalysis | null>(null);
  const [seasonality, setSeasonality] = useState<SeasonalityAnalysis | null>(null);
  const [metrics, setMetrics] = useState<ForecastMetrics | null>(null);
  const [insights, setInsights] = useState<ForecastInsight[]>([]);

  // Filter products for search
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products.slice(0, 10);
    const term = searchTerm.toLowerCase();
    return products
      .filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.sku.toLowerCase().includes(term)
      )
      .slice(0, 10);
  }, [products, searchTerm]);

  // Generate forecast when product or period changes
  const handleGenerateForecast = async () => {
    if (!selectedProduct) {
      toast.error("Selecione um produto");
      return;
    }

    setIsLoading(true);

    try {
      // Try to fetch real sales history
      let historicalData = await fetchSalesHistory(selectedProduct.id, 12);

      // If no real data, generate synthetic data
      const hasRealData = historicalData.some(d => d.value > 0);
      if (!hasRealData) {
        historicalData = generateSyntheticHistory(
          selectedProduct.category,
          selectedProduct.salePrice,
          12
        );
        toast.info("Dados sintéticos gerados", {
          description: "Sem histórico real, usando estimativa baseada na categoria e preço."
        });
      }

      setHistorical(historicalData);

      // Generate forecast
      const { forecasts: forecastData, method, metrics: forecastMetrics } = generateForecast(
        historicalData,
        period,
        'auto'
      );

      setForecasts(forecastData);
      setMetrics(forecastMetrics);

      // Analyze trend and seasonality
      const trendAnalysis = detectTrend(historicalData);
      const seasonalityAnalysis = detectSeasonality(historicalData);
      setTrend(trendAnalysis);
      setSeasonality(seasonalityAnalysis);

      // Generate insights
      const forecastInsights = generateInsights(
        forecastData,
        historicalData,
        selectedProduct.quantity,
        selectedProduct.name
      );
      setInsights(forecastInsights);

      toast.success("Previsão gerada!", {
        description: `Método: ${getMethodName(method)} | Precisão: ${forecastMetrics.accuracy}%`
      });

    } catch (error) {
      console.error("Error generating forecast:", error);
      toast.error("Erro ao gerar previsão", {
        description: "Tente novamente em alguns instantes."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodName = (method: string) => {
    const names: Record<string, string> = {
      'moving_average': 'Média Móvel',
      'linear_regression': 'Regressão Linear',
      'holt_winters': 'Holt-Winters',
    };
    return names[method] || method;
  };

  // Prepare chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];

    // Add historical data
    historical.forEach(h => {
      data.push({
        month: h.month,
        date: h.date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        historical: h.value,
      });
    });

    // Add forecast data
    forecasts.forEach(f => {
      data.push({
        month: f.month,
        date: f.date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        forecast: f.value,
        lower: f.lower,
        upper: f.upper,
      });
    });

    return data;
  }, [historical, forecasts]);

  // Find next peak month
  const nextPeakMonth = useMemo(() => {
    if (forecasts.length === 0) return null;
    return forecasts.reduce((max, f) => f.value > max.value ? f : max, forecasts[0]);
  }, [forecasts]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm("");
    setShowProductSearch(false);
    // Reset forecast data
    setHistorical([]);
    setForecasts([]);
    setTrend(null);
    setSeasonality(null);
    setMetrics(null);
    setInsights([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Previsão de Demanda com IA</CardTitle>
              <CardDescription>
                Análise preditiva baseada em dados históricos e algoritmos avançados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Product Search */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto por nome ou SKU..."
                  value={selectedProduct ? selectedProduct.name : searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowProductSearch(true);
                    if (selectedProduct) setSelectedProduct(null);
                  }}
                  onFocus={() => setShowProductSearch(true)}
                  className="pl-10"
                />
              </div>
              
              {/* Product Dropdown */}
              {showProductSearch && filteredProducts.length > 0 && !selectedProduct && (
                <Card className="absolute z-50 w-full mt-1 max-h-[300px] overflow-auto shadow-lg">
                  <CardContent className="p-2">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0">
                          {product.quantity} un
                        </Badge>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Period Selector */}
            <Select value={String(period)} onValueChange={(v) => setPeriod(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
                <SelectItem value="24">24 meses</SelectItem>
              </SelectContent>
            </Select>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateForecast}
              disabled={!selectedProduct || isLoading}
              className="min-w-[160px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Previsão
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Analisando dados históricos...</p>
          <p className="text-muted-foreground">Aplicando algoritmos de previsão</p>
        </div>
      )}

      {/* Empty State */}
      {!selectedProduct && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted/50 rounded-full mb-4">
              <Brain className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Previsão Inteligente de Demanda
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Selecione um produto para gerar uma previsão baseada em IA. 
              Analisamos seu histórico de vendas para prever tendências e recomendar estoque.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" /> Tendências
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" /> Sazonalidade
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Target className="h-3 w-3" /> Precisão 87%+
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {selectedProduct && forecasts.length > 0 && !isLoading && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Trend Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tendência</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {trend?.direction === 'crescimento' ? '+' : trend?.direction === 'queda' ? '-' : ''}
                        {Math.abs(trend?.rate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 rounded-full",
                    trend?.direction === 'crescimento' ? "bg-success/10" :
                    trend?.direction === 'queda' ? "bg-destructive/10" :
                    "bg-warning/10"
                  )}>
                    {trend?.direction === 'crescimento' ? (
                      <TrendingUp className="h-6 w-6 text-success" />
                    ) : trend?.direction === 'queda' ? (
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    ) : (
                      <Minus className="h-6 w-6 text-warning" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 capitalize">
                  {trend?.direction || 'estável'}
                </p>
              </CardContent>
            </Card>

            {/* Accuracy Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Precisão do Modelo</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{metrics?.accuracy || 0}%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {getMethodName(metrics?.method || '')}
                </p>
              </CardContent>
            </Card>

            {/* Next Peak Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Próximo Pico</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {nextPeakMonth?.month || '-'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-warning/10">
                    <Calendar className="h-6 w-6 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {nextPeakMonth ? `~${nextPeakMonth.value} unidades` : 'Sem previsão'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Previsão de Vendas
                  </CardTitle>
                  <CardDescription>
                    Histórico vs. Previsão para {selectedProduct.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Histórico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/50 border-2 border-primary border-dashed" />
                    <span className="text-muted-foreground">Previsão</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          historical: 'Histórico',
                          forecast: 'Previsão',
                          upper: 'Limite Superior',
                          lower: 'Limite Inferior',
                        };
                        return [
                          `${value} un`,
                          labels[name] || name
                        ];
                      }}
                    />
                    
                    {/* Confidence interval area */}
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="transparent"
                      fill="url(#confidenceGradient)"
                      name="upper"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="transparent"
                      fill="hsl(var(--background))"
                      name="lower"
                    />
                    
                    {/* Historical line */}
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="historical"
                    />
                    
                    {/* Forecast line */}
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))", r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="forecast"
                    />

                    {/* Reference line for current stock */}
                    <ReferenceLine 
                      y={selectedProduct.quantity} 
                      stroke="hsl(var(--warning))" 
                      strokeDasharray="4 4"
                      label={{ 
                        value: `Estoque: ${selectedProduct.quantity}`, 
                        position: 'right',
                        fill: 'hsl(var(--warning))',
                        fontSize: 11
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Insights da IA
                </CardTitle>
                <CardDescription>
                  Análise automatizada baseada nos seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border-l-4",
                      insight.type === 'warning' || insight.priority === 'high' 
                        ? "border-warning bg-warning/5" 
                        : insight.type === 'trend' && trend?.direction === 'crescimento'
                        ? "border-success bg-success/5"
                        : insight.type === 'trend' && trend?.direction === 'queda'
                        ? "border-destructive bg-destructive/5"
                        : "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{insight.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {insight.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Seasonality Info */}
                {seasonality?.hasSeasonality && (
                  <div className="p-3 rounded-lg bg-muted/50 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Padrão Sazonal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {seasonality.pattern}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Forecast Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Previsão Detalhada
                </CardTitle>
                <CardDescription>
                  Próximos {period} meses com intervalo de confiança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead className="text-right">Previsão</TableHead>
                        <TableHead className="text-right">Intervalo (95%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forecasts.map((f, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {f.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold">{f.value}</span>
                            <span className="text-muted-foreground text-sm ml-1">un</span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {f.lower} - {f.upper}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Stock Recommendation */}
                {forecasts.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Recomendação de Estoque</span>
                    </div>
                    {(() => {
                      const totalDemand = forecasts.slice(0, 3).reduce((sum, f) => sum + f.value, 0);
                      const currentStock = selectedProduct.quantity;
                      const needed = Math.max(0, totalDemand - currentStock);
                      
                      if (needed > 0) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            Para atender a demanda dos próximos 3 meses (~{totalDemand} un), 
                            recomendamos repor <span className="font-semibold text-primary">+{Math.ceil(needed)} unidades</span>.
                          </p>
                        );
                      }
                      return (
                        <p className="text-sm text-muted-foreground">
                          Estoque atual ({currentStock} un) é suficiente para os próximos 3 meses (~{totalDemand} un previstos).
                        </p>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Data Insufficient Warning */}
          {historical.length < 3 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Precisão limitada</AlertTitle>
              <AlertDescription>
                Com apenas {historical.length} meses de dados, a previsão pode ser menos precisa. 
                Continue registrando vendas para melhorar a acurácia do modelo.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
