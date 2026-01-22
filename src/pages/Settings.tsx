import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/useSettings";
import { CurrencySettingsSection } from "@/components/settings/CurrencySettingsSection";
import { CompanySettingsSection } from "@/components/settings/CompanySettingsSection";
import { CalculationSettingsSection } from "@/components/settings/CalculationSettingsSection";
import { TaxSettingsSection } from "@/components/settings/TaxSettingsSection";
import { AlertSettingsSection } from "@/components/settings/AlertSettingsSection";
import { UnitSettingsSection } from "@/components/settings/UnitSettingsSection";
import { ExportSettingsSection } from "@/components/settings/ExportSettingsSection";
import { BackupSettingsSection } from "@/components/settings/BackupSettingsSection";
import { Settings as SettingsIcon, Building2, Calculator, Database, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  const {
    settings,
    hasChanges,
    isSaving,
    updateSettings,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    formatCurrency,
  } = useSettings();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Personalize o sistema de acordo com suas necessidades</p>
        </div>
        
        <Button 
          onClick={saveSettings} 
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="py-3 px-4">
            <p className="text-sm text-warning-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              Você tem alterações não salvas. Clique em "Salvar Alterações" para persistir.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="general" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Negócio</span>
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Cálculos</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Avançado</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 sm:space-y-6">
          <CurrencySettingsSection
            settings={settings.currency}
            onUpdate={(updates) => updateSettings('currency', updates)}
            formatCurrency={formatCurrency}
          />
          <UnitSettingsSection
            settings={settings.units}
            onUpdate={(updates) => updateSettings('units', updates)}
          />
        </TabsContent>

        <TabsContent value="business" className="space-y-4 sm:space-y-6">
          <CompanySettingsSection
            settings={settings.company}
            onUpdate={(updates) => updateSettings('company', updates)}
          />
          <TaxSettingsSection
            settings={settings.taxes}
            onUpdate={(updates) => updateSettings('taxes', updates)}
          />
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4 sm:space-y-6">
          <CalculationSettingsSection
            settings={settings.calculations}
            onUpdate={(updates) => updateSettings('calculations', updates)}
          />
          <AlertSettingsSection
            settings={settings.alerts}
            onUpdate={(updates) => updateSettings('alerts', updates)}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 sm:space-y-6">
          <ExportSettingsSection
            settings={settings.export}
            onUpdate={(updates) => updateSettings('export', updates)}
          />
          <BackupSettingsSection
            onExport={exportSettings}
            onImport={importSettings}
            onReset={resetSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
