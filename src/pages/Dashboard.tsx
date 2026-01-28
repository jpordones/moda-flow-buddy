import { useNavigate } from "react-router-dom";
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
  CostsOverviewCard,
  PricingOverviewCard,
  CashFlowSummaryCard,
  EmptyStateCard,
  GetStartedSection,
  DemandForecastShortcut,
} from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, TrendingUp, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    isLoading,
    transactions,
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
    costsMetrics,
    pricingMetrics,
  } = useDashboardData();
  
  const { products, isLoading: productsLoading } = useProducts();

  // Derived states for conditional rendering
  const hasProducts = products && products.length > 0;
  const hasTransactions = transactions && transactions.length > 0;
  const hasCosts = costsMetrics.totalFixedCosts > 0 || costsMetrics.totalVariableCosts > 0;
  const hasActiveProducts = products?.filter(p => p.status === 'ativo').length > 0;
  
  // Check if chart has any real data
  const chartHasData = financialChartData.some(d => d.revenue > 0 || d.profit !== 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
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

      {/* Get Started Section - Mostrar quando falta configuração básica */}
      {(!hasProducts || !hasTransactions || !hasCosts) && (
        <GetStartedSection 
          hasProducts={hasProducts} 
          hasTransactions={hasTransactions} 
          hasCosts={hasCosts} 
        />
      )}

      {/* Central de Ações - Só mostrar quando há produtos para analisar */}
      {!productsLoading && hasProducts && (
        <ActionCenter products={products} />
      )}

      {/* Seção 1: KPIs Principais - Sempre visíveis com estados amigáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <HealthScoreCard
          healthScore={healthMetrics.healthScore}
          liquidityScore={healthMetrics.liquidityScore}
          marginScore={healthMetrics.marginScore}
          stockScore={healthMetrics.stockScore}
          onViewProblems={() => navigate('/app/produtos')}
        />

        <RevenueGoalCard
          currentRevenue={monthlyMetrics.totalIncome}
          revenueGoal={revenueGoal}
          projectedRevenue={monthlyMetrics.projectedRevenue}
        />

        <CashFlowSummaryCard
          totalIncome={monthlyMetrics.totalIncome}
          totalExpenses={monthlyMetrics.totalExpense}
          balance={monthlyMetrics.balance}
          pendingReceivables={monthlyMetrics.pendingReceivables}
          pendingPayables={monthlyMetrics.pendingPayables}
        />
      </div>

      {/* Seção 2: Custos, Precificação e Margens - Mostrar quando há produtos OU custos */}
      {(hasProducts || hasCosts) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <CostsOverviewCard
            totalFixedCosts={costsMetrics.totalFixedCosts}
            totalVariableCosts={costsMetrics.totalVariableCosts}
            averageCostPerUnit={costsMetrics.averageCostPerUnit}
            monthlyVolume={costsMetrics.monthlyVolume}
          />

          <PricingOverviewCard
            averageMargin={pricingMetrics.averageMargin}
            averageSalePrice={pricingMetrics.averageSalePrice}
            averageCostPrice={pricingMetrics.averageCostPrice}
            productsNeedingReview={pricingMetrics.productsNeedingReview}
            totalProducts={pricingMetrics.totalProducts}
          />

          <MarginCard
            averageMargin={healthMetrics.averageMargin}
            marginTrend={2.5}
            topMarginProducts={productAnalytics.topMarginProducts.map(p => ({
              name: p.name,
              margin: p.margin,
            }))}
          />
        </div>
      )}

      {/* Seção 3: Estoque e Riscos - Só mostrar quando há produtos */}
      {hasProducts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
      )}

      {/* Seção 4: Gráfico Principal de Performance */}
      {chartHasData ? (
        <FinancialChart
          data={financialChartData}
          insights={insights}
        />
      ) : (
        <EmptyStateCard
          icon={BarChart3}
          title="Sem dados de performance ainda"
          description="O gráfico será preenchido automaticamente quando você registrar transações no Fluxo de Caixa."
          actionLabel="Adicionar Transação"
          actionUrl="/app/fluxo-caixa"
        />
      )}

      {/* Seção 5: Análise de Produtos - Só mostrar quando há produtos */}
      {hasProducts && (
        <ProductAnalysisCards
          topProducts={productAnalytics.topProducts}
          lowMarginProducts={productAnalytics.lowMarginProducts}
          outOfStockProducts={productAnalytics.outOfStockProducts}
          slowMovingProducts={productAnalytics.slowMovingProducts}
        />
      )}

      {/* Seção 6: Insights com IA - Mostrar quando há dados suficientes */}
      {(hasProducts || hasTransactions) && (
        <AIInsightsCard
          predictedRevenue={predictedRevenue}
          revenueGoal={revenueGoal}
          restockSuggestions={restockSuggestions}
          slowMovingValue={inventoryBreakdown.slowMovingValue}
        />
      )}

      {/* Card de atalho para Previsão de Demanda */}
      {hasProducts && <DemandForecastShortcut />}
    </div>
  );
}
