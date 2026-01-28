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
import { RotateCcw, FileDown, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { exportCostsReportPdf } from '@/lib/costsReportPdf';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function Costs() {
  const { profile } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);
  const [openSections, setOpenSections] = useState({
    volume: true,
    product: true,
    fixed: false,
    variable: false,
    taxes: false,
  });
  
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

  const scrollToConfig = () => {
    configRef.current?.scrollIntoView({ behavior: 'smooth' });
    setOpenSections(prev => ({ ...prev, volume: true }));
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
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
                    Salvo
                  </>
                )}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Sistema de Precificação Profissional
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} className="h-9">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
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

      {/* ===== BLOCO A: Resultado Final ===== */}
      <section className="space-y-4">
        <PricingResultsCards result={result} />
        <SmartAlertsSection result={result} data={data} />
      </section>

      {/* ===== BLOCO B: Análise Detalhada ===== */}
      <section className="space-y-4">
        <PriceAnatomyCard result={result} data={data} />
      </section>

      {/* ===== BLOCO C: Comparações e Cenários ===== */}
      <section className="space-y-4">
        <MarketComparisonCard result={result} data={data} onScrollToConfig={scrollToConfig} />
        <MonthlyImpactCard result={result} data={data} />
        <PricingAnalysisSection result={result} scenarios={scenarios} alerts={alerts} />
      </section>

      {/* ===== BLOCO D: Configurações (com acordeões) ===== */}
      <section ref={configRef} className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">Configurações</h2>
        
        {/* Volume e Margem */}
        <Collapsible open={openSections.volume} onOpenChange={() => toggleSection('volume')}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <span className="text-lg">📊</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Volume e Margem</p>
                  <p className="text-xs text-muted-foreground">Produção mensal e lucro desejado</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections.volume ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <VolumeAndMarginSection
              config={data.config}
              totalFixedCosts={totalFixedCosts}
              onUpdate={updateConfig}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Custos do Produto */}
        <Collapsible open={openSections.product} onOpenChange={() => toggleSection('product')}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <span className="text-lg">📦</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Custos Diretos do Produto</p>
                  <p className="text-xs text-muted-foreground">Materiais, aviamentos, mão de obra</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections.product ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <ProductCostsSection
              costs={data.productCosts}
              onUpdate={updateProductCosts}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Custos Fixos */}
        <Collapsible open={openSections.fixed} onOpenChange={() => toggleSection('fixed')}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <span className="text-lg">🏢</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Custos Fixos Mensais</p>
                  <p className="text-xs text-muted-foreground">Aluguel, salários, software</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections.fixed ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <FixedMonthlyCostsSection
              costs={data.fixedCosts}
              onUpdate={updateFixedCosts}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Custos Variáveis de Venda */}
        <Collapsible open={openSections.variable} onOpenChange={() => toggleSection('variable')}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <span className="text-lg">🛒</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Custos de Venda</p>
                  <p className="text-xs text-muted-foreground">Marketplace, frete, marketing</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections.variable ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <VariableSalesCostsSection
              costs={data.variableCosts}
              onUpdate={updateVariableCosts}
              onSetMarketplace={setMarketplacePreset}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Impostos */}
        <Collapsible open={openSections.taxes} onOpenChange={() => toggleSection('taxes')}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-danger/10">
                  <span className="text-lg">🧾</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Impostos</p>
                  <p className="text-xs text-muted-foreground">Regime tributário e alíquotas</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections.taxes ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <TaxSettingsSection
              taxes={data.taxes}
              onUpdate={updateTaxes}
            />
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  );
}
