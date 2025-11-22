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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Comparação de Cenários de Preço</CardTitle>
        <CardDescription>
          Análise comparativa entre diferentes estratégias de precificação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Cenário</TableHead>
                <TableHead className="font-semibold text-right">Preço de Venda</TableHead>
                <TableHead className="font-semibold text-right">Lucro/Peça</TableHead>
                <TableHead className="font-semibold text-right">Margem %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cenarios.map((cenario, index) => (
                <TableRow 
                  key={index}
                  className={
                    cenario.variant === 'success' 
                      ? 'bg-success/5 hover:bg-success/10' 
                      : cenario.variant === 'danger'
                      ? 'bg-danger/5 hover:bg-danger/10'
                      : 'hover:bg-muted/50'
                  }
                >
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{cenario.nome}</p>
                      <p className="text-xs text-muted-foreground">{cenario.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      R$ {cenario.preco.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span 
                      className={`text-lg font-semibold ${
                        cenario.lucro > 0 ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      R$ {cenario.lucro.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span 
                      className={`text-lg font-semibold ${
                        cenario.margem > 0 ? 'text-success' : 'text-muted-foreground'
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

        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Nota:</strong> O cenário "Ideal" é calculado com base nos custos reais 
            e na margem de lucro desejada. Custos percentuais (taxas, impostos) são aplicados sobre o preço de venda.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
