export interface CurrencySettings {
  symbol: string;
  decimalSeparator: ',' | '.';
  thousandSeparator: '.' | ',' | ' ';
  decimalPlaces: 0 | 2 | 3 | 4;
}

export interface CompanySettings {
  name: string;
  logo: string | null;
  document: string;
  defaultCurrency: string;
}

export interface CalculationDefaults {
  defaultProfitMargin: number;
  defaultPremiumMargin: number;
  defaultMonthlySales: number;
  defaultMarkupRate: number;
}

export interface TaxSettings {
  includeTaxes: boolean;
  taxPercentage: number;
  taxBreakdown: {
    id: string;
    name: string;
    percentage: number;
    enabled: boolean;
  }[];
}

export interface CategoryTemplate {
  id: string;
  name: string;
  defaultValue: number;
  type: 'fixed' | 'variable';
}

export interface AlertSettings {
  lowMarginAlert: boolean;
  lowMarginThreshold: number;
  belowCostAlert: boolean;
  belowCostBuffer: number;
  monthlyReviewReminder: boolean;
}

export interface UnitSettings {
  defaultUnit: 'unit' | 'kg' | 'g' | 'liter' | 'ml' | 'meter' | 'cm' | 'pack' | 'box';
  customUnitLabel: string;
}

export interface ExportSettings {
  includeLogo: boolean;
  includeCompanyInfo: boolean;
  includeCostBreakdown: boolean;
  includeCharts: boolean;
  defaultFileName: string;
  pdfColorScheme: 'default' | 'minimal' | 'branded';
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'high-contrast';
}

export interface UserSettings {
  currency: CurrencySettings;
  company: CompanySettings;
  calculations: CalculationDefaults;
  taxes: TaxSettings;
  categoryTemplates: CategoryTemplate[];
  alerts: AlertSettings;
  units: UnitSettings;
  export: ExportSettings;
  theme: ThemeSettings;
}

export const defaultSettings: UserSettings = {
  currency: {
    symbol: 'R$',
    decimalSeparator: ',',
    thousandSeparator: '.',
    decimalPlaces: 2,
  },
  company: {
    name: '',
    logo: null,
    document: '',
    defaultCurrency: 'BRL',
  },
  calculations: {
    defaultProfitMargin: 30,
    defaultPremiumMargin: 50,
    defaultMonthlySales: 100,
    defaultMarkupRate: 0,
  },
  taxes: {
    includeTaxes: false,
    taxPercentage: 0,
    taxBreakdown: [
      { id: '1', name: 'ICMS', percentage: 18, enabled: false },
      { id: '2', name: 'PIS', percentage: 1.65, enabled: false },
      { id: '3', name: 'COFINS', percentage: 7.6, enabled: false },
      { id: '4', name: 'ISS', percentage: 5, enabled: false },
    ],
  },
  categoryTemplates: [
    { id: '1', name: 'Matéria-prima', defaultValue: 0, type: 'variable' },
    { id: '2', name: 'Embalagem', defaultValue: 0, type: 'variable' },
    { id: '3', name: 'Mão de obra direta', defaultValue: 0, type: 'variable' },
    { id: '4', name: 'Aluguel', defaultValue: 0, type: 'fixed' },
    { id: '5', name: 'Energia', defaultValue: 0, type: 'fixed' },
  ],
  alerts: {
    lowMarginAlert: true,
    lowMarginThreshold: 10,
    belowCostAlert: true,
    belowCostBuffer: 5,
    monthlyReviewReminder: false,
  },
  units: {
    defaultUnit: 'unit',
    customUnitLabel: 'Peça',
  },
  export: {
    includeLogo: true,
    includeCompanyInfo: true,
    includeCostBreakdown: true,
    includeCharts: false,
    defaultFileName: 'relatorio-precificacao',
    pdfColorScheme: 'default',
  },
  theme: {
    mode: 'light',
  },
};
