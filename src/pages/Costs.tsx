import { usePricingCalculator } from '@/hooks/usePricingCalculator';
import { VolumeAndMarginSection } from '@/components/pricing/VolumeAndMarginSection';
import { ProductCostsSection } from '@/components/pricing/ProductCostsSection';
import { FixedMonthlyCostsSection } from '@/components/pricing/FixedMonthlyCostsSection';
import { VariableSalesCostsSection } from '@/components/pricing/VariableSalesCostsSection';
import { TaxSettingsSection } from '@/components/pricing/TaxSettingsSection';
import { PricingResultsCards } from '@/components/pricing/PricingResultsCards';
import { PricingAnalysisSection } from '@/components/pricing/PricingAnalysisSection';
import { Button } from '@/components/ui/button';
import { RotateCcw, FileDown } from 'lucide-react';

export default function Costs() {
  const {
    data,
    result,
    scenarios,
    alerts,
    updateProductCosts,
    updateFixedCosts,
    updateVariableCosts,
    updateTaxes,
    updateConfig,
    setMarketplacePreset,
    resetToDefaults,
  } = usePricingCalculator();

  const totalFixedCosts = Object.values(data.fixedCosts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Custos & Precificação
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de Precificação Profissional LAMAR Pro
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} className="h-10">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button variant="outline" size="sm" className="h-10">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resultados */}
      <PricingResultsCards result={result} />

      {/* Análise */}
      <PricingAnalysisSection result={result} scenarios={scenarios} alerts={alerts} />

      {/* Grid Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Volume, Margem e Produto */}
        <div className="space-y-6">
          <VolumeAndMarginSection
            config={data.config}
            totalFixedCosts={totalFixedCosts}
            onUpdate={updateConfig}
          />
          <ProductCostsSection
            costs={data.productCosts}
            onUpdate={updateProductCosts}
          />
        </div>

        {/* Coluna Direita - Custos Fixos, Variáveis e Impostos */}
        <div className="space-y-6">
          <FixedMonthlyCostsSection
            costs={data.fixedCosts}
            onUpdate={updateFixedCosts}
          />
          <VariableSalesCostsSection
            costs={data.variableCosts}
            onUpdate={updateVariableCosts}
            onSetMarketplace={setMarketplacePreset}
          />
          <TaxSettingsSection
            taxes={data.taxes}
            onUpdate={updateTaxes}
          />
        </div>
      </div>
    </div>
  );
}
