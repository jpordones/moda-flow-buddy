import { usePricingCalculator } from '@/hooks/usePricingCalculator';
import { VolumeAndMarginSection } from '@/components/pricing/VolumeAndMarginSection';
import { ProductCostsSection } from '@/components/pricing/ProductCostsSection';
import { FixedMonthlyCostsSection } from '@/components/pricing/FixedMonthlyCostsSection';
import { VariableSalesCostsSection } from '@/components/pricing/VariableSalesCostsSection';
import { TaxSettingsSection } from '@/components/pricing/TaxSettingsSection';
import { PricingResultsCards } from '@/components/pricing/PricingResultsCards';
import { PricingAnalysisSection } from '@/components/pricing/PricingAnalysisSection';
import { PriceAnatomyCard } from '@/components/pricing/PriceAnatomyCard';
import { MarketComparisonCard } from '@/components/pricing/MarketComparisonCard';
import { MonthlyImpactCard } from '@/components/pricing/MonthlyImpactCard';
import { SmartAlertsSection } from '@/components/pricing/SmartAlertsSection';
import { Button } from '@/components/ui/button';
import { RotateCcw, FileDown, Loader2, Cloud, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { exportCostsReportPdf } from '@/lib/costsReportPdf';
import { toast } from 'sonner';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function Costs() {
  const { profile } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    data,
    result,
    scenarios,
    alerts,
    isLoaded,
    isSaving,
    updateProductCosts,
    updateFixedCosts,
    updateVariableCosts,
    updateTaxes,
    updateConfig,
    setMarketplacePreset,
    resetToDefaults,
  } = usePricingCalculator();

  const totalFixedCosts = Object.values(data.fixedCosts).reduce((a, b) => a + b, 0);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportCostsReportPdf({
        data,
        result,
        scenarios,
        alerts,
        companyInfo: {
          companyName: profile?.company_name || null,
          logoUrl: profile?.logo_url || null,
          document: profile?.company_document || null,
        },
      });
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar o relatório PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Custos & Precificação
            </h1>
            {isLoaded && (
              <Badge variant="outline" className="gap-1 text-xs">
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Salvo na nuvem
                  </>
                )}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Sistema de Precificação Profissional LAMAR Pro
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} className="h-10">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10"
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Gerando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <SmartAlertsSection result={result} data={data} />

      {/* Resultados */}
      <PricingResultsCards result={result} />

      {/* Anatomia do Preço */}
      <PriceAnatomyCard result={result} data={data} />

      {/* Comparação com Mercado */}
      <MarketComparisonCard result={result} data={data} />

      {/* Impacto Financeiro Mensal */}
      <MonthlyImpactCard result={result} data={data} />

      {/* Análise de Cenários */}
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
