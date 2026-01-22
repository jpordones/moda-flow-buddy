import { useNavigate } from "react-router-dom";
import { DemandForecast } from "@/components/DemandForecast";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProducts } from "@/hooks/useProducts";
import {
  HealthScoreCard,
  RevenueGoalCard,
  MarginCard,
  RiskProductsCard,
  StockTurnoverCard,
  InventoryValueCard,
  FinancialChart,
  ProductAnalysisCards,
  AIInsightsCard,
  ActionCenter,
} from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    isLoading,
    monthlyMetrics,
    healthMetrics,
    productAnalytics,
    inventoryBreakdown,
    stockTurnover,
    financialChartData,
    insights,
    restockSuggestions,
    revenueGoal,
    predictedRevenue,
    stats,
  } = useDashboardData();
  
  const { products, isLoading: productsLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Painel analítico completo do seu negócio
        </p>
      </div>

      {/* Central de Ações - Prioridade máxima */}
      {!productsLoading && products && products.length > 0 && (
        <ActionCenter products={products} />
      )}

      {/* Seção 1: KPIs Acionáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <HealthScoreCard
          healthScore={healthMetrics.healthScore}
          liquidityScore={healthMetrics.liquidityScore}
          marginScore={healthMetrics.marginScore}
          stockScore={healthMetrics.stockScore}
          onViewProblems={() => navigate('/produtos')}
        />

        <RevenueGoalCard
          currentRevenue={monthlyMetrics.totalIncome}
          revenueGoal={revenueGoal}
          projectedRevenue={monthlyMetrics.projectedRevenue}
        />

        <MarginCard
          averageMargin={healthMetrics.averageMargin}
          marginTrend={2.5} // Would calculate from historical data
          topMarginProducts={productAnalytics.topMarginProducts.map(p => ({
            name: p.name,
            margin: p.margin,
          }))}
        />

        <RiskProductsCard
          totalRiskProducts={productAnalytics.riskProducts.length}
          outOfStockCount={stats.outOfStockCount}
          lowStockCount={stats.lowStockCount}
          lowMarginCount={productAnalytics.lowMarginProducts.length}
        />

        <StockTurnoverCard
          stockTurnover={stockTurnover}
          slowMovingProducts={productAnalytics.slowMovingProducts.slice(0, 2).map(p => ({
            name: p.name,
            daysInStock: p.daysInStock,
          }))}
        />

        <InventoryValueCard
          inventoryValue={inventoryBreakdown.totalCost}
          fastMovingValue={inventoryBreakdown.fastMovingValue}
          slowMovingValue={inventoryBreakdown.slowMovingValue}
        />
      </div>

      {/* Seção 2: Gráfico Principal de Performance */}
      <FinancialChart
        data={financialChartData}
        insights={insights}
      />

      {/* Seção 3: Análise de Produtos */}
      <ProductAnalysisCards
        topProducts={productAnalytics.topProducts}
        lowMarginProducts={productAnalytics.lowMarginProducts}
        outOfStockProducts={productAnalytics.outOfStockProducts}
        slowMovingProducts={productAnalytics.slowMovingProducts}
      />

      {/* Seção 4: Insights com IA */}
      <AIInsightsCard
        predictedRevenue={predictedRevenue}
        revenueGoal={revenueGoal}
        restockSuggestions={restockSuggestions}
        slowMovingValue={inventoryBreakdown.slowMovingValue}
      />

      {/* Previsão de Demanda com IA */}
      <DemandForecast />
    </div>
  );
}
