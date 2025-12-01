import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ResultadosCalculo } from '@/types/costs';

interface CostBreakdownChartProps {
  resultados: ResultadosCalculo;
}

const COLORS = ['#059669', '#0891b2', '#f59e0b', '#8b5cf6'];

export function CostBreakdownChart({ resultados }: CostBreakdownChartProps) {
  const data = [
    {
      name: 'Custo Variável',
      value: resultados.custoVariavelTotal,
      color: COLORS[0],
    },
    {
      name: 'Custo Fixo/Peça',
      value: resultados.custoFixoPorPeca,
      color: COLORS[1],
    },
    {
      name: 'Lucro',
      value: resultados.lucroPorPeca > 0 ? resultados.lucroPorPeca : 0,
      color: COLORS[2],
    },
  ].filter(item => item.value > 0);

  const total = resultados.precoIdeal;

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-foreground">R$ {data.value.toFixed(2)}</p>
          <p className="text-muted-foreground text-sm">
            {((data.value / total) * 100).toFixed(1)}% do preço
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="p-6">
        <CardTitle className="text-gray-900">Composição do Preço</CardTitle>
        <CardDescription className="text-gray-600">
          Distribuição dos custos e margem no preço ideal
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value: string) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary below chart */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-success/10 rounded-lg">
            <p className="text-xs text-gray-600">Custo Variável</p>
            <p className="text-lg font-bold text-success">
              R$ {resultados.custoVariavelTotal.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-info/10 rounded-lg">
            <p className="text-xs text-gray-600">Custo Fixo</p>
            <p className="text-lg font-bold text-info">
              R$ {resultados.custoFixoPorPeca.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg">
            <p className="text-xs text-gray-600">Lucro</p>
            <p className="text-lg font-bold text-warning">
              R$ {resultados.lucroPorPeca.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
