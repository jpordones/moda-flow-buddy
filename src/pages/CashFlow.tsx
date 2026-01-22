import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Lock, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useCashFlow, CashFlowTransaction, PeriodType } from "@/hooks/useCashFlow";
import {
  CashFlowStats,
  CashFlowChart,
  CashFlowInsights,
  CategoryBreakdown,
  TransactionList,
  TransactionDialog,
} from "@/components/cashflow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function CashFlow() {
  const { canUseFeature, currentPlan, loading: subscriptionLoading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashFlowTransaction | null>(null);

  const {
    transactions,
    stats,
    categoryBreakdown,
    chartData,
    insights,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useCashFlow(period);

  const hasAccess = canUseFeature('has_cash_flow');

  const handleAddTransaction = async (data: Parameters<typeof addTransaction>[0]) => {
    try {
      await addTransaction(data);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Erro ao adicionar transação');
      throw error;
    }
  };

  const handleEditTransaction = async (data: Parameters<typeof addTransaction>[0]) => {
    if (!editingTransaction) return;
    try {
      await updateTransaction(editingTransaction.id, data);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação');
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success('Transação excluída');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir transação');
    }
  };

  const openEditDialog = (transaction: CashFlowTransaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    toast.info(`Exportando em ${format.toUpperCase()}...`);
    // TODO: Implement PDF export
  };

  // Show blocked state if no access
  if (!subscriptionLoading && !hasAccess) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Fluxo de Caixa
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Controle financeiro completo do seu negócio
            </p>
          </div>
        </div>

        {/* Blurred preview */}
        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <Card className="max-w-md text-center p-6">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Funcionalidade Premium</h3>
              <p className="text-muted-foreground mb-4">
                O Fluxo de Caixa está disponível a partir do plano Profissional. 
                Faça upgrade para gerenciar suas finanças.
              </p>
              <Button onClick={() => setShowUpgradeModal(true)} className="gap-2" variant="default">
                <Crown className="h-4 w-4" />
                Ver Planos
              </Button>
            </Card>
          </div>

          {/* Preview content */}
          <div className="opacity-50 pointer-events-none space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-32" />
                </Card>
              ))}
            </div>
            <Card className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </Card>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Fluxo de Caixa"
          requiredPlan="professional"
          currentPlan={currentPlan?.plan_type}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            💰 Fluxo de Caixa
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Controle financeiro completo do seu negócio
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="gap-2 flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <CashFlowStats stats={stats} isLoading={isLoading} />

      {/* Chart */}
      <CashFlowChart 
        data={chartData} 
        period={period} 
        onPeriodChange={setPeriod} 
      />

      {/* Insights */}
      <CashFlowInsights insights={insights} />

      {/* Category Breakdown */}
      <CategoryBreakdown 
        income={categoryBreakdown.income}
        expenses={categoryBreakdown.expenses}
        totalIncome={stats.totalIncome}
        totalExpenses={stats.totalExpenses}
      />

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onEdit={openEditDialog}
        onDelete={handleDeleteTransaction}
        isLoading={isLoading}
      />

      {/* Add/Edit Dialog */}
      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
        editingTransaction={editingTransaction}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Fluxo de Caixa"
        requiredPlan="professional"
        currentPlan={currentPlan?.plan_type}
      />
    </div>
  );
}
