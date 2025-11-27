import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResultadosCalculo } from '@/types/costs';

interface PriceComparisonTableProps {
  resultados: ResultadosCalculo;
}

export function PriceComparisonTable({ resultados }: PriceComparisonTableProps) {
  const cenarios = [
    {
      nome: 'Break-Even (Mínimo)',
      preco: resultados.precoMinimo,
      lucro: 0,
      margem: 0,
      description: 'Preço para cobrir todos os custos sem lucro',
      variant: 'danger' as const,
    },
    {
      nome: 'Ideal (Margem Padrão)',
      preco: resultados.precoIdeal,
      lucro: resultados.lucroPorPeca,
      margem: resultados.margemPercentual,
      description: 'Preço recomendado com margem desejada',
      variant: 'success' as const,
    },
    {
      nome: 'Premium',
      preco: resultados.precoPremium,
      lucro: resultados.precoPremium - resultados.custoRealCompleto,
      margem: ((resultados.precoPremium - resultados.custoRealCompleto) / resultados.precoPremium) * 100,
      description: 'Preço para posicionamento premium',
      variant: 'default' as const,
    },
  ];

  return (
    <Card>
      <CardHeader className="p-6">
        <CardTitle className="text-gray-900">Comparação de Cenários de Preço</CardTitle>
        <CardDescription className="text-gray-600">
          Análise comparativa entre diferentes estratégias de precificação
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cenário</TableHead>
                <TableHead className="text-right">Preço de Venda</TableHead>
                <TableHead className="text-right">Lucro/Peça</TableHead>
                <TableHead className="text-right">Margem %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cenarios.map((cenario, index) => (
                <TableRow 
                  key={index}
                  className={
                    cenario.variant === 'success' 
                      ? 'bg-success-light/50 hover:bg-success-light' 
                      : cenario.variant === 'danger'
                      ? 'bg-danger-light/50 hover:bg-danger-light'
                      : ''
                  }
                >
                  <TableCell>
                    <div>
                      <p className="font-semibold text-gray-900">{cenario.nome}</p>
                      <p className="text-xs text-gray-600">{cenario.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      R$ {cenario.preco.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span 
                      className={`text-lg font-semibold ${
                        cenario.lucro > 0 ? 'text-success' : 'text-gray-600'
                      }`}
                    >
                      R$ {cenario.lucro.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span 
                      className={`text-lg font-semibold ${
                        cenario.margem > 0 ? 'text-success' : 'text-gray-600'
                      }`}
                    >
                      {cenario.margem.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-4 bg-warning-light/30 rounded-xl border border-warning/20">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Nota:</strong> O cenário "Ideal" é calculado com base nos custos reais 
            e na margem de lucro desejada. Custos percentuais (taxas, impostos) são aplicados sobre o preço de venda.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
