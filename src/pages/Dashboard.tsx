import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Package, AlertCircle, ShoppingBag } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState, useCallback } from "react";
import { DemandForecast } from "@/components/DemandForecast";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatarMoeda } from "@/lib/formatters";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  reference_date: string;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { products, stats } = useProducts();

  const teamId = profile?.current_team_id;

  const fetchTransactions = useCallback(async () => {
    if (!teamId) {
      setTransactions([]);
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('id, type, amount, category, reference_date')
      .eq('team_id', teamId)
      .order('reference_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } else {
      setTransactions(data || []);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Cálculos de métricas
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.reference_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter(t => t.type === "saida")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const totalStock = stats.totalStock;
  const stockValue = stats.totalValue;
  const lowStockItems = stats.lowStockCount;

  // Dados para gráfico de fluxo
  const cashFlowData = [
    { name: "Jan", entrada: 15000, saida: 8000 },
    { name: "Fev", entrada: 18000, saida: 9500 },
    { name: "Mar", entrada: 22000, saida: 11000 },
    { name: "Abr", entrada: 19000, saida: 10500 },
    { name: "Mai", entrada: 25000, saida: 12000 },
    { name: "Jun", entrada: 28000, saida: 13500 },
  ];

  // Dados para gráfico de despesas por categoria
  const expensesByCategory = [
    { name: "Fornecedores", value: 4500 },
    { name: "Matéria-prima", value: 3200 },
    { name: "Salários", value: 2800 },
    { name: "Marketing", value: 1500 },
    { name: "Outros", value: 1000 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Métricas principais - Responsive grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Saldo em Caixa"
          value={formatarMoeda(balance)}
          icon={DollarSign}
          variant="success"
          trend={{ value: "12% vs mês anterior", positive: balance >= 0 }}
        />
        <MetricCard
          title="Entradas do Mês"
          value={formatarMoeda(totalIncome)}
          icon={TrendingUp}
          variant="success"
          trend={{ value: "8% vs mês anterior", positive: true }}
        />
        <MetricCard
          title="Saídas do Mês"
          value={formatarMoeda(totalExpense)}
          icon={TrendingDown}
          variant="danger"
          trend={{ value: "3% vs mês anterior", positive: false }}
        />
        <MetricCard
          title="Produtos em Estoque"
          value={totalStock.toString()}
          icon={Package}
          variant="info"
          trend={stats.totalProducts === 0 
            ? { value: "Adicione produtos para ver métricas", positive: true }
            : { value: `${lowStockItems} com estoque baixo`, positive: lowStockItems === 0 }
          }
        />
      </div>

      {/* Secondary metrics - Responsive grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Valor Total do Estoque"
          value={formatarMoeda(stockValue)}
          icon={ShoppingBag}
          variant="indigo"
        />
        <MetricCard
          title="Lucro/Prejuízo Mensal"
          value={formatarMoeda(balance)}
          icon={balance >= 0 ? TrendingUp : TrendingDown}
          variant="success"
        />
        <MetricCard
          title="Alertas de Estoque"
          value={lowStockItems.toString()}
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Gráficos - Responsive grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm border rounded-xl">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-foreground">Fluxo de Caixa</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">Evolução de entradas e saídas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} width={50} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))", fontSize: "12px" }} />
                <Line type="monotone" dataKey="entrada" stroke="hsl(var(--success))" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="saida" stroke="hsl(var(--danger))" strokeWidth={2} name="Saídas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-foreground">Entradas vs Saídas</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">Comparativo do mês atual</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
              <BarChart data={[{ name: "Este Mês", entrada: totalIncome, saida: totalExpense }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} width={50} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))", fontSize: "12px" }} />
                <Bar dataKey="entrada" fill="hsl(var(--success))" name="Entradas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saida" fill="hsl(var(--danger))" name="Saídas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl lg:col-span-2">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-foreground">Despesas por Categoria</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">Distribuição dos gastos do mês</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  className="text-xs sm:text-sm"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Previsão de Demanda com IA */}
      <DemandForecast />
    </div>
  );
}
