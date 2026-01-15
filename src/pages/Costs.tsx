import { useCostsCalculator } from '@/hooks/useCostsCalculator';
import { FixedCostsSection } from '@/components/costs/FixedCostsSection';
import { VariableCostsSection } from '@/components/costs/VariableCostsSection';
import { ParametersSection } from '@/components/costs/ParametersSection';
import { ResultsCards } from '@/components/costs/ResultsCards';
import { PriceComparisonTable } from '@/components/costs/PriceComparisonTable';
import { CostBreakdownChart } from '@/components/costs/CostBreakdownChart';
import { ExportButtons } from '@/components/costs/ExportButtons';

export default function Costs() {
  const {
    custosFixos,
    custosVariaveis,
    parametros,
    resultados,
    adicionarCustoFixo,
    atualizarCustoFixo,
    removerCustoFixo,
    adicionarCustoVariavel,
    atualizarCustoVariavel,
    removerCustoVariavel,
    atualizarParametros,
  } = useCostsCalculator();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Custos & Precificação
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema inteligente de precificação LAMAR
          </p>
        </div>
        <ExportButtons
          custosFixos={custosFixos}
          custosVariaveis={custosVariaveis}
          parametros={parametros}
          resultados={resultados}
        />
      </div>

      {/* Cards de Resultados */}
      <ResultsCards resultados={resultados} />

      {/* Grid Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Inputs */}
        <div className="space-y-6">
          <FixedCostsSection
            custosFixos={custosFixos}
            onAdd={adicionarCustoFixo}
            onUpdate={atualizarCustoFixo}
            onDelete={removerCustoFixo}
          />
          
          <VariableCostsSection
            custosVariaveis={custosVariaveis}
            onAdd={adicionarCustoVariavel}
            onUpdate={atualizarCustoVariavel}
            onDelete={removerCustoVariavel}
          />
        </div>

        {/* Coluna Direita - Parâmetros, Gráfico e Comparação */}
        <div className="space-y-6">
          <ParametersSection
            parametros={parametros}
            onUpdate={atualizarParametros}
          />
          
          <CostBreakdownChart resultados={resultados} />
          
          <PriceComparisonTable resultados={resultados} />
        </div>
      </div>
    </div>
  );
}
