import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserSettings, defaultSettings } from '@/types/settings';

export function useSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from profile on mount
  useEffect(() => {
    if (profile) {
      setSettings({
        currency: {
          symbol: profile.currency_symbol || 'R$',
          decimalSeparator: (profile.decimal_separator as ',' | '.') || ',',
          thousandSeparator: (profile.thousand_separator as '.' | ',' | ' ') || '.',
          decimalPlaces: (profile.decimal_places as 0 | 2 | 3 | 4) || 2,
        },
        company: {
          name: profile.company_name || '',
          logo: profile.logo_url || null,
          document: profile.company_document || '',
          defaultCurrency: profile.default_currency || 'BRL',
        },
        calculations: {
          defaultProfitMargin: Number(profile.default_margin) || 30,
          defaultPremiumMargin: Number(profile.default_premium_margin) || 50,
          defaultMonthlySales: Number(profile.default_monthly_sales) || 100,
          defaultMarkupRate: Number(profile.default_markup_rate) || 0,
        },
        taxes: {
          includeTaxes: profile.include_taxes ?? false,
          taxPercentage: Number(profile.state_tax || 0) + Number(profile.municipal_tax || 0),
          taxBreakdown: Array.isArray(profile.tax_breakdown) 
            ? profile.tax_breakdown as UserSettings['taxes']['taxBreakdown']
            : defaultSettings.taxes.taxBreakdown,
        },
        categoryTemplates: defaultSettings.categoryTemplates, // Keep as default
        alerts: {
          lowMarginAlert: profile.low_margin_alert ?? true,
          lowMarginThreshold: Number(profile.low_margin_threshold) || 10,
          belowCostAlert: profile.below_cost_alert ?? true,
          belowCostBuffer: Number(profile.below_cost_buffer) || 5,
          monthlyReviewReminder: profile.monthly_review_reminder ?? false,
        },
        units: {
          defaultUnit: (profile.default_unit as UserSettings['units']['defaultUnit']) || 'unit',
          customUnitLabel: profile.custom_unit_label || 'Peça',
        },
        export: {
          includeLogo: profile.export_include_logo ?? true,
          includeCompanyInfo: profile.export_include_company_info ?? true,
          includeCostBreakdown: profile.export_include_cost_breakdown ?? true,
          includeCharts: profile.export_include_charts ?? false,
          defaultFileName: profile.export_filename_pattern || 'relatorio-precificacao',
          pdfColorScheme: (profile.export_pdf_color_scheme as 'default' | 'minimal' | 'branded') || 'default',
        },
        theme: {
          mode: 'light',
        },
      });
      setIsLoading(false);
    }
  }, [profile]);

  // Update a section of settings
  const updateSettings = useCallback(<K extends keyof UserSettings>(
    section: K,
    updates: Partial<UserSettings[K]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    setHasChanges(true);
  }, []);

  // Save all settings to Supabase
  const saveSettings = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSaving(true);

    try {
      // Map local settings to database columns
      const updates = {
        // Currency
        currency_symbol: settings.currency.symbol,
        decimal_separator: settings.currency.decimalSeparator,
        thousand_separator: settings.currency.thousandSeparator,
        decimal_places: settings.currency.decimalPlaces,
        
        // Company
        company_name: settings.company.name,
        company_document: settings.company.document,
        default_currency: settings.company.defaultCurrency,
        
        // Calculations
        default_margin: settings.calculations.defaultProfitMargin,
        default_premium_margin: settings.calculations.defaultPremiumMargin,
        default_monthly_sales: settings.calculations.defaultMonthlySales,
        default_markup_rate: settings.calculations.defaultMarkupRate,
        
        // Taxes
        include_taxes: settings.taxes.includeTaxes,
        tax_breakdown: settings.taxes.taxBreakdown,
        
        // Alerts
        low_margin_alert: settings.alerts.lowMarginAlert,
        low_margin_threshold: settings.alerts.lowMarginThreshold,
        below_cost_alert: settings.alerts.belowCostAlert,
        below_cost_buffer: settings.alerts.belowCostBuffer,
        monthly_review_reminder: settings.alerts.monthlyReviewReminder,
        
        // Units
        default_unit: settings.units.defaultUnit,
        custom_unit_label: settings.units.customUnitLabel,
        
        // Export
        export_include_logo: settings.export.includeLogo,
        export_include_company_info: settings.export.includeCompanyInfo,
        export_include_cost_breakdown: settings.export.includeCostBreakdown,
        export_include_charts: settings.export.includeCharts,
        export_filename_pattern: settings.export.defaultFileName,
        export_pdf_color_scheme: settings.export.pdfColorScheme,
        
        // Updated timestamp
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao salvar configurações:', error);
        toast.error('Erro ao salvar configurações', {
          description: error.message
        });
        return;
      }

      await refreshProfile();
      setHasChanges(false);

      toast.success('Configurações salvas com sucesso!', {
        description: 'Suas preferências foram atualizadas'
      });

    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast.error('Erro ao salvar', {
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, settings, refreshProfile]);

  // Reset to default settings
  const resetSettings = useCallback(async () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info('Configurações redefinidas', {
      description: 'Clique em Salvar para confirmar'
    });
  }, []);

  // Export settings as JSON
  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'configuracoes-fedcom.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configurações exportadas!');
  }, [settings]);

  // Import settings from JSON
  const importSettings = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings({ ...defaultSettings, ...imported });
          setHasChanges(true);
          toast.success('Configurações importadas!', {
            description: 'Clique em Salvar para confirmar'
          });
          resolve();
        } catch (error) {
          reject(new Error('Arquivo de configurações inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

  // Format currency using current settings
  const formatCurrency = useCallback((value: number): string => {
    const { symbol, decimalSeparator, thousandSeparator, decimalPlaces } = settings.currency;
    
    const fixed = value.toFixed(decimalPlaces);
    const [intPart, decPart] = fixed.split('.');
    
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    
    if (decimalPlaces === 0) {
      return `${symbol} ${formattedInt}`;
    }
    
    return `${symbol} ${formattedInt}${decimalSeparator}${decPart}`;
  }, [settings.currency]);

  return {
    settings,
    hasChanges,
    isLoading,
    isSaving,
    setHasChanges,
    updateSettings,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    formatCurrency,
  };
}
