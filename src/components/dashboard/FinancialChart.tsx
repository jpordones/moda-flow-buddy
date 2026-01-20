import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FinancialDataPoint {
  month: string;
  revenue: number;
  profit: number;
  margin: number;
  previousRevenue?: number;
  goal?: number;
}

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

interface FinancialChartProps {
  data: FinancialDataPoint[];
  insights: Insight[];
}

export function FinancialChart({ data, insights }: FinancialChartProps) {
  const [timeRange, setTimeRange] = useState("6m");
  const [comparison, setComparison] = useState("goal");

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Performance Financeira</CardTitle>
            <CardDescription>
              Análise comparativa dos últimos 6 meses
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={comparison} onValueChange={setComparison}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem comparação</SelectItem>
                <SelectItem value="previous">vs Período anterior</SelectItem>
                <SelectItem value="lastyear">vs Ano passado</SelectItem>
                <SelectItem value="goal">vs Meta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))"
              }} 
              formatter={(value: number, name: string) => {
                if (name === "Margem (%)") return [`${value.toFixed(1)}%`, name];
                return [`R$ ${value.toLocaleString('pt-BR')}`, name];
              }}
            />
            <Legend />

            <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Faturamento" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="left" dataKey="profit" fill="hsl(var(--success))" name="Lucro" radius={[8, 8, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="margin" stroke="hsl(var(--warning))" strokeWidth={2} name="Margem (%)" />
            
            {comparison === 'goal' && (
              <Line yAxisId="left" type="monotone" dataKey="goal" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
            )}

            {comparison === 'previous' && (
              <Area yAxisId="left" type="monotone" dataKey="previousRevenue" fill="hsl(var(--muted))" stroke="hsl(var(--muted-foreground))" fillOpacity={0.3} name="Período Anterior" />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {insights.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className={cn(
                "p-4 rounded-lg border-l-4",
                insight.type === "success" ? "border-success bg-success/5" :
                insight.type === "warning" ? "border-warning bg-warning/5" :
                "border-info bg-info/5"
              )}>
                <div className="flex items-start gap-2">
                  {insight.type === "success" ? <TrendingUp className="h-5 w-5 text-success mt-0.5" /> :
                   insight.type === "warning" ? <AlertTriangle className="h-5 w-5 text-warning mt-0.5" /> :
                   <Lightbulb className="h-5 w-5 text-info mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{insight.title}</p>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
