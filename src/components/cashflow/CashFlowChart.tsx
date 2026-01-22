import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartDataPoint, PeriodType } from "@/hooks/useCashFlow";
import { formatarMoeda } from "@/lib/formatters";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CashFlowChartProps {
  data: ChartDataPoint[];
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function CashFlowChart({ data, period, onPeriodChange }: CashFlowChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              📈 Evolução Financeira
            </CardTitle>
            <CardDescription>
              Acompanhe a evolução de entradas, saídas e saldo
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(v) => onPeriodChange(v as PeriodType)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    income: 'Entradas',
                    expenses: 'Saídas',
                    balance: 'Saldo',
                  };
                  return [formatarMoeda(value), labels[name] || name];
                }}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    income: 'Entradas',
                    expenses: 'Saídas',
                    balance: 'Saldo',
                  };
                  return labels[value] || value;
                }}
              />
              
              <Bar 
                dataKey="income" 
                fill="hsl(var(--success))" 
                name="income"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey="expenses" 
                fill="hsl(var(--destructive))" 
                name="expenses"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                name="balance"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
