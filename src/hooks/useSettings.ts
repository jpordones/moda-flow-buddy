import { useState, useEffect, useCallback } from 'react';
import { UserSettings, defaultSettings } from '@/types/settings';

const SETTINGS_STORAGE_KEY = 'lamar-user-settings';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return defaultSettings;
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

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

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(true);
  }, []);

  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lamar-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  const importSettings = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings({ ...defaultSettings, ...imported });
          setHasChanges(true);
          resolve();
        } catch (error) {
          reject(new Error('Arquivo de configurações inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

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
    setHasChanges,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    formatCurrency,
  };
}
