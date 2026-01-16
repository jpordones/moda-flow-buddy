import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle, Info, XCircle, TrendingUp } from 'lucide-react';
import { PricingResult, PricingScenario, PricingAlert } from '@/types/pricing';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';

interface PricingAnalysisSectionProps {
  result: PricingResult;
  scenarios: PricingScenario[];
  alerts: PricingAlert[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

export function PricingAnalysisSection({ result, scenarios, alerts }: PricingAnalysisSectionProps) {
  if (!result.viable) return null;

  const chartData = [
    { name: 'Custo Produto', value: result.breakdown.productCost, color: '#3b82f6' },
    { name: 'Custos Fixos', value: result.breakdown.fixedCostsPerUnit, color: '#f59e0b' },
    { name: 'Custos Variáveis', value: result.breakdown.variableFixedCosts, color: '#ef4444' },
    { name: 'Taxas + Impostos', value: result.breakdown.feesAmount + result.breakdown.taxesAmount, color: '#8b5cf6' },
    { name: 'Lucro', value: result.breakdown.profitAmount, color: '#10b981' },
  ].filter(item => item.value > 0);

  const alertIcons = {
    error: <XCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Alert key={i} variant={alert.type === 'error' ? 'destructive' : 'default'} className={
              alert.type === 'success' ? 'border-success bg-success/10' :
              alert.type === 'warning' ? 'border-warning bg-warning/10' : ''
            }>
              {alertIcons[alert.type]}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Composição */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Composição do Preço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cenários */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground text-lg">Análise de Cenários</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cenário</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.name}>
                    <TableCell className="font-medium">
                      {scenario.emoji} {scenario.name}
                    </TableCell>
                    <TableCell className="text-right">{scenario.volume}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(scenario.price)}</TableCell>
                    <TableCell className={`text-right font-semibold ${scenario.profit > 0 ? 'text-success' : 'text-danger'}`}>
                      {formatarMoeda(scenario.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
