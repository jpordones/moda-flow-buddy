import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  PricingData,
  PricingResult,
  PricingScenario,
  PricingAlert,
  ProductCosts,
  FixedMonthlyCosts,
  VariableSalesCosts,
  TaxSettings,
  PricingConfig,
  defaultPricingData,
  marketplacePresets,
} from '@/types/pricing';

// =============================================================================
// FÓRMULA DE PRECIFICAÇÃO PROFISSIONAL PARA E-COMMERCE
// =============================================================================
function calculatePricing(data: PricingData): PricingResult {
  const { productCosts, fixedCosts, variableCosts, taxes, config } = data;
  
  // 1. CUSTO DIRETO DO PRODUTO
  const directCost =
    productCosts.fabric +
    productCosts.accessories +
    productCosts.packaging +
    productCosts.laborCost +
    productCosts.qualityControl +
    productCosts.photography +
    productCosts.other;

  // 2. TOTAL DE CUSTOS FIXOS MENSAIS
  const totalFixedCostsMonthly =
    fixedCosts.rent +
    fixedCosts.utilities +
    fixedCosts.internet +
    fixedCosts.salaries +
    fixedCosts.benefits +
    fixedCosts.software +
    fixedCosts.accounting +
    fixedCosts.insurance +
    fixedCosts.maintenance +
    fixedCosts.other;

  // 3. CUSTOS FIXOS DILUÍDOS (por unidade)
  const fixedCostPerUnit =
    config.monthlyVolume > 0
      ? totalFixedCostsMonthly / config.monthlyVolume
      : 0;

  // 4. CUSTO TOTAL ANTES DA VENDA
  const totalCostBeforeSale = directCost + fixedCostPerUnit;

  // 5. CUSTOS VARIÁVEIS FIXOS (R$ por venda)
  const variableFixedCosts =
    variableCosts.shippingCost +
    variableCosts.shippingPackaging +
    variableCosts.marketplaceShipping;

  // 6. TAXAS VARIÁVEIS TOTAIS (%)
  const variableFeesPercent =
    (variableCosts.marketplaceFee +
      variableCosts.paymentGateway +
      variableCosts.reverseLogistics +
      variableCosts.adsCost +
      variableCosts.affiliateCommission) / 100;

  // 7. IMPOSTOS TOTAIS (%)
  const taxPercent =
    taxes.taxRegime === 'simples'
      ? taxes.simplesRate / 100
      : (taxes.icms + taxes.pis + taxes.cofins) / 100;

  // 8. MARGEM DESEJADA (%)
  const marginPercent = config.desiredMargin / 100;

  // 9. DENOMINADOR DA FÓRMULA
  // Preço = (Custo Total + Custos Fixos Venda) ÷ (1 - Taxas% - Impostos% - Margem%)
  const denominator = 1 - variableFeesPercent - taxPercent - marginPercent;

  // Verificar viabilidade
  if (denominator <= 0) {
    return {
      viable: false,
      error: `Impossível precificar: taxas (${(variableFeesPercent * 100).toFixed(1)}%) + impostos (${(taxPercent * 100).toFixed(1)}%) + margem (${config.desiredMargin}%) >= 100%`,
      calculatedPrice: 0,
      suggestedPrice: 0,
      minimumPrice: 0,
      premiumPrice: 0,
      directCost,
      fixedCostPerUnit,
      totalCostBeforeSale,
      variableFixedCosts,
      variableFeesPercent,
      taxPercent,
      grossProfit: 0,
      netProfit: 0,
      netMargin: 0,
      competitiveness: null,
      breakdown: {
        productCost: directCost,
        fixedCostsPerUnit: fixedCostPerUnit,
        variableFixedCosts,
        feesAmount: 0,
        taxesAmount: 0,
        profitAmount: 0,
      },
      totalFixedCostsMonthly,
    };
  }

  // 10. PREÇO CALCULADO
  const calculatedPrice = (totalCostBeforeSale + variableFixedCosts) / denominator;

  // 11. PREÇO SUGERIDO (psicológico - R$ X,99)
  const suggestedPrice = Math.ceil(calculatedPrice / 0.99) * 0.99;

  // 12. PREÇO MÍNIMO (break-even, margem 0%)
  const minDenominator = 1 - variableFeesPercent - taxPercent;
  const minimumPrice = minDenominator > 0 
    ? (totalCostBeforeSale + variableFixedCosts) / minDenominator 
    : calculatedPrice;

  // 13. PREÇO PREMIUM (margem maior)
  const premiumMargin = Math.min(config.desiredMargin + 20, 60) / 100;
  const premiumDenominator = 1 - variableFeesPercent - taxPercent - premiumMargin;
  const premiumPrice = premiumDenominator > 0
    ? (totalCostBeforeSale + variableFixedCosts) / premiumDenominator
    : calculatedPrice * 1.5;

  // 14. CÁLCULOS DE LUCRO
  const feesAmount = calculatedPrice * variableFeesPercent;
  const taxesAmount = calculatedPrice * taxPercent;
  const totalCosts = totalCostBeforeSale + variableFixedCosts + feesAmount + taxesAmount;
  const grossProfit = calculatedPrice - totalCostBeforeSale - variableFixedCosts;
  const netProfit = calculatedPrice - totalCosts;
  const netMargin = calculatedPrice > 0 ? (netProfit / calculatedPrice) * 100 : 0;

  // 15. COMPARAÇÃO COM MERCADO
  const competitiveness =
    config.marketPrice > 0
      ? ((calculatedPrice - config.marketPrice) / config.marketPrice) * 100
      : null;

  return {
    viable: true,
    calculatedPrice: Math.round(calculatedPrice * 100) / 100,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    minimumPrice: Math.round(minimumPrice * 100) / 100,
    premiumPrice: Math.round(premiumPrice * 100) / 100,
    directCost,
    fixedCostPerUnit,
    totalCostBeforeSale,
    variableFixedCosts,
    variableFeesPercent,
    taxPercent,
    grossProfit,
    netProfit,
    netMargin,
    competitiveness,
    breakdown: {
      productCost: directCost,
      fixedCostsPerUnit: fixedCostPerUnit,
      variableFixedCosts,
      feesAmount,
      taxesAmount,
      profitAmount: netProfit,
    },
    totalFixedCostsMonthly,
  };
}

// =============================================================================
// HOOK PRINCIPAL
// =============================================================================
export function usePricingCalculator() {
  const { profile, user } = useAuth();
  const teamId = profile?.current_team_id;
  
  const [data, setData] = useState<PricingData>(defaultPricingData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Carregar dados do Supabase
  useEffect(() => {
    async function loadSettings() {
      if (!teamId) {
        setIsLoaded(true);
        return;
      }

      try {
        const { data: settings, error } = await supabase
          .from('pricing_settings')
          .select('*')
          .eq('team_id', teamId)
          .maybeSingle();

        if (error) {
          console.error('Erro ao carregar configurações de precificação:', error);
        } else if (settings && settings.data) {
          setSettingsId(settings.id);
          // Parse the JSON data safely
          const savedData = (typeof settings.data === 'object' && settings.data !== null) 
            ? settings.data as Record<string, unknown>
            : {};
          
          // Merge with defaults to ensure all fields exist
          setData({
            productCosts: { 
              ...defaultPricingData.productCosts, 
              ...(savedData.productCosts as Partial<ProductCosts> || {})
            },
            fixedCosts: { 
              ...defaultPricingData.fixedCosts, 
              ...(savedData.fixedCosts as Partial<FixedMonthlyCosts> || {})
            },
            variableCosts: { 
              ...defaultPricingData.variableCosts, 
              ...(savedData.variableCosts as Partial<VariableSalesCosts> || {})
            },
            taxes: { 
              ...defaultPricingData.taxes, 
              ...(savedData.taxes as Partial<TaxSettings> || {})
            },
            config: { 
              ...defaultPricingData.config, 
              ...(savedData.config as Partial<PricingConfig> || {})
            },
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadSettings();
  }, [teamId]);

  // Salvar dados no Supabase quando alterados
  const saveSettings = useCallback(async (newData: PricingData) => {
    if (!teamId || !user || !isLoaded) return;

    setIsSaving(true);
    try {
      // Convert to JSON-compatible format
      const jsonData = JSON.parse(JSON.stringify(newData));
      
      if (settingsId) {
        // Update existing
        const { error } = await supabase
          .from('pricing_settings')
          .update({ 
            data: jsonData,
            updated_at: new Date().toISOString()
          })
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        // Insert new
        const { data: inserted, error } = await supabase
          .from('pricing_settings')
          .insert([{
            team_id: teamId,
            user_id: user.id,
            data: jsonData,
          }])
          .select()
          .single();

        if (error) throw error;
        if (inserted) setSettingsId(inserted.id);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  }, [teamId, user, isLoaded, settingsId]);

  // Debounced save
  useEffect(() => {
    if (!isLoaded) return;
    
    const timeoutId = setTimeout(() => {
      saveSettings(data);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [data, isLoaded, saveSettings]);

  // Cálculos principais
  const result = useMemo(() => calculatePricing(data), [data]);

  // Cenários de análise
  const scenarios = useMemo((): PricingScenario[] => {
    const { config, fixedCosts } = data;
    const totalFixed = Object.values(fixedCosts).reduce((a, b) => a + b, 0);
    
    const multipliers = [
      { name: 'Pessimista', emoji: '😰', mult: 0.7 },
      { name: 'Realista', emoji: '😊', mult: 1 },
      { name: 'Otimista', emoji: '🚀', mult: 1.5 },
    ];

    return multipliers.map(({ name, emoji, mult }) => {
      const volume = Math.round(config.monthlyVolume * mult);
      const scenarioData: PricingData = {
        ...data,
        config: { ...config, monthlyVolume: volume },
      };
      const scenarioResult = calculatePricing(scenarioData);
      
      return {
        name,
        emoji,
        volumeMultiplier: mult,
        volume,
        fixedCostPerUnit: volume > 0 ? totalFixed / volume : 0,
        price: scenarioResult.suggestedPrice,
        profit: scenarioResult.netProfit,
        margin: scenarioResult.netMargin,
      };
    });
  }, [data]);

  // Alertas inteligentes
  const alerts = useMemo((): PricingAlert[] => {
    const alertList: PricingAlert[] = [];
    
    if (!result.viable) {
      alertList.push({
        type: 'error',
        title: 'Precificação impossível',
        message: result.error || 'Verifique suas taxas e margens',
      });
      return alertList;
    }

    // Margem muito baixa
    if (result.netMargin < data.config.minimumMargin) {
      alertList.push({
        type: 'error',
        title: 'Margem abaixo do mínimo',
        message: `Sua margem (${result.netMargin.toFixed(1)}%) está abaixo do mínimo aceitável (${data.config.minimumMargin}%)`,
      });
    } else if (result.netMargin < 15) {
      alertList.push({
        type: 'warning',
        title: 'Margem muito baixa',
        message: `Margem de ${result.netMargin.toFixed(1)}% é arriscada. Considere aumentar o preço ou reduzir custos.`,
      });
    }

    // Volume baixo diluindo muito os custos fixos
    if (result.fixedCostPerUnit > result.calculatedPrice * 0.3) {
      alertList.push({
        type: 'warning',
        title: 'Volume de produção baixo',
        message: `Os custos fixos representam ${((result.fixedCostPerUnit / result.calculatedPrice) * 100).toFixed(0)}% do preço. Aumente o volume para diluir melhor.`,
      });
    }

    // Preço não competitivo
    if (result.competitiveness !== null && result.competitiveness > 20) {
      alertList.push({
        type: 'warning',
        title: 'Produto não competitivo',
        message: `Seu preço está ${result.competitiveness.toFixed(0)}% acima do mercado. Analise se o diferencial justifica.`,
      });
    }

    // Carga tributária alta
    const totalTaxesAndFees = result.variableFeesPercent + result.taxPercent;
    if (totalTaxesAndFees > 0.4) {
      alertList.push({
        type: 'warning',
        title: 'Carga tributária alta',
        message: `Taxas + impostos somam ${(totalTaxesAndFees * 100).toFixed(0)}% do preço. Avalie otimizações fiscais.`,
      });
    }

    // Sucesso
    if (alertList.length === 0 && result.netMargin >= 20) {
      alertList.push({
        type: 'success',
        title: 'Boa precificação!',
        message: `Margem de ${result.netMargin.toFixed(1)}% está saudável para o negócio.`,
      });
    }

    return alertList;
  }, [result, data.config.minimumMargin]);

  // Funções de atualização
  const updateProductCosts = useCallback((updates: Partial<ProductCosts>) => {
    setData(prev => ({
      ...prev,
      productCosts: { ...prev.productCosts, ...updates },
    }));
  }, []);

  const updateFixedCosts = useCallback((updates: Partial<FixedMonthlyCosts>) => {
    setData(prev => ({
      ...prev,
      fixedCosts: { ...prev.fixedCosts, ...updates },
    }));
  }, []);

  const updateVariableCosts = useCallback((updates: Partial<VariableSalesCosts>) => {
    setData(prev => ({
      ...prev,
      variableCosts: { ...prev.variableCosts, ...updates },
    }));
  }, []);

  const updateTaxes = useCallback((updates: Partial<TaxSettings>) => {
    setData(prev => ({
      ...prev,
      taxes: { ...prev.taxes, ...updates },
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<PricingConfig>) => {
    setData(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const setMarketplacePreset = useCallback((type: keyof typeof marketplacePresets) => {
    const preset = marketplacePresets[type];
    setData(prev => ({
      ...prev,
      variableCosts: {
        ...prev.variableCosts,
        marketplaceType: type,
        marketplaceFee: preset.fee,
      },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setData(defaultPricingData);
  }, []);

  return {
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
  };
}
