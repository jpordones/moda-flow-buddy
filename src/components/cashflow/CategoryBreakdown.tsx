import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBreakdown as CategoryData } from "@/hooks/useCashFlow";
import { formatarMoeda } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
interface CategoryBreakdownProps {
  income: CategoryData[];
  expenses: CategoryData[];
  totalIncome: number;
  totalExpenses: number;
}
export function CategoryBreakdown({
  income,
  expenses,
  totalIncome,
  totalExpenses
}: CategoryBreakdownProps) {
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Resumo por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="income" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Despesas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span className="text-muted-foreground">Total de Receitas</span>
              <span className="text-success">{formatarMoeda(totalIncome)}</span>
            </div>
            
            {income.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma receita registrada neste período
              </p> : <div className="space-y-3">
                {income.map((cat, idx) => <CategoryItem key={idx} category={cat} type="income" />)}
              </div>}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span className="text-muted-foreground">Total de Despesas</span>
              <span className="text-destructive">{formatarMoeda(totalExpenses)}</span>
            </div>
            
            {expenses.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma despesa registrada neste período
              </p> : <div className="space-y-3">
                {expenses.map((cat, idx) => <CategoryItem key={idx} category={cat} type="expense" />)}
              </div>}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
}
function CategoryItem({
  category,
  type
}: {
  category: CategoryData;
  type: 'income' | 'expense';
}) {
  return <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span>{category.icon}</span>
          <span className="font-medium truncate max-w-[150px]">{category.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            ({category.percentage.toFixed(0)}%)
          </span>
          <span className={type === 'income' ? 'text-success' : 'text-destructive'}>
            {formatarMoeda(category.amount)}
          </span>
        </div>
      </div>
      <Progress value={category.percentage} className="h-2" style={{
      // Custom color for the progress indicator
      ['--progress-background' as any]: category.color
    }} />
    </div>;
}