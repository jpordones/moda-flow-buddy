import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Package, AlertCircle, ShoppingBag } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState, useCallback } from "react";
import { DemandForecast } from "@/components/DemandForecast";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Saldo em Caixa"
          value={`R$ ${balance.toFixed(2)}`}
          icon={DollarSign}
          variant="success"
          trend={{ value: "12% vs mês anterior", positive: balance >= 0 }}
        />
        <MetricCard
          title="Entradas do Mês"
          value={`R$ ${totalIncome.toFixed(2)}`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: "8% vs mês anterior", positive: true }}
        />
        <MetricCard
          title="Saídas do Mês"
          value={`R$ ${totalExpense.toFixed(2)}`}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Valor Total do Estoque"
          value={`R$ ${stockValue.toFixed(2)}`}
          icon={ShoppingBag}
          variant="indigo"
        />
        <MetricCard
          title="Lucro/Prejuízo Mensal"
          value={`R$ ${balance.toFixed(2)}`}
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

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border rounded-xl">
          <CardHeader>
            <CardTitle className="text-gray-900">Fluxo de Caixa</CardTitle>
            <CardDescription className="text-gray-600">Evolução de entradas e saídas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)" 
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="entrada" stroke="hsl(var(--success))" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="saida" stroke="hsl(var(--danger))" strokeWidth={2} name="Saídas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl">
          <CardHeader>
            <CardTitle className="text-gray-900">Entradas vs Saídas</CardTitle>
            <CardDescription className="text-gray-600">Comparativo do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{ name: "Este Mês", entrada: totalIncome, saida: totalExpense }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)" 
                  }} 
                />
                <Legend />
                <Bar dataKey="entrada" fill="hsl(var(--success))" name="Entradas" />
                <Bar dataKey="saida" fill="hsl(var(--danger))" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900">Despesas por Categoria</CardTitle>
            <CardDescription className="text-gray-600">Distribuição dos gastos do mês</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)" 
                  }} 
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
